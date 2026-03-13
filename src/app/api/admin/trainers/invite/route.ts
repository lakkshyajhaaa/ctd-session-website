import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { email, organization } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
        }

        // Check if an invite already exists and is pending
        const existingInvite = await prisma.trainerInvite.findUnique({
            where: { email }
        });
        if (existingInvite && existingInvite.status === "PENDING" && existingInvite.expiresAt > new Date()) {
            return NextResponse.json({ error: "An active invite already exists for this email" }, { status: 400 });
        }

        // Generate secure token
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

        const invite = await prisma.trainerInvite.upsert({
            where: { email },
            update: {
                token,
                organization,
                status: "PENDING",
                expiresAt,
                createdAt: new Date()
            },
            create: {
                email,
                organization,
                token,
                expiresAt
            }
        });

        // In a real application, you would send an email here using SendGrid/Resend
        // For this prototype, we'll return the invite link in the response
        const inviteLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/register/trainer?token=${token}`;

        return NextResponse.json({
            message: "Invite generated successfully",
            inviteLink,
            invite
        });

    } catch (error) {
        console.error("Error generating invite:", error);
        return NextResponse.json(
            { error: "Failed to generate invite" },
            { status: 500 }
        );
    }
}
