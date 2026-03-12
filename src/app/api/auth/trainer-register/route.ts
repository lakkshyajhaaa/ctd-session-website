import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const trainerRegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
    token: z.string().min(1, "Invite token is required"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = trainerRegisterSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { name, password, token } = result.data;

        // 1. Verify Token
        const invite = await prisma.trainerInvite.findUnique({
            where: { token },
        });

        if (!invite) {
            return NextResponse.json({ error: "Invalid invite token" }, { status: 400 });
        }

        if (invite.status !== "PENDING" || invite.expiresAt < new Date()) {
            return NextResponse.json({ error: "Invite has expired or was already used" }, { status: 400 });
        }

        // 2. Hash Password
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Create User natively overriding `role`, `status` and `invitedByAdmin` restrictions
        const user = await prisma.user.create({
            data: {
                name,
                email: invite.email,
                passwordHash,
                role: "TRAINER",
                status: "APPROVED",
                organization: invite.organization,
                invitedByAdmin: true,
            },
        });

        // 4. Mark Invite as ACCEPTED to lock replay attacks
        await prisma.trainerInvite.update({
            where: { id: invite.id },
            data: { status: "ACCEPTED" },
        });

        return NextResponse.json({
            message: "Trainer account created successfully!",
            user: { id: user.id, email: user.email, name: user.name }
        });

    } catch (error) {
        console.error("Trainer Registration error:", error);

        // Catch Prisma unique constraint violations seamlessly
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === "P2002") {
            return NextResponse.json(
                { error: "A user with this email already exists." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
