import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, code, password } = body;

        // Reject structurally invalid requests natively
        if (!email || !code || code.length !== 6 || !password || password.length < 8) {
            return NextResponse.json({ error: "Invalid request payloads or insufficient password complexity." }, { status: 400 });
        }

        // Locate the exact token requested avoiding generic array fetches
        const tokenRecord = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: code,
                type: "RESET_PASSWORD",
            },
        });

        if (!tokenRecord) {
            return NextResponse.json({ error: "This secure reset link is invalid or has already been used." }, { status: 400 });
        }

        // Mathematically verify Expiration thresholds strictly
        if (new Date() > tokenRecord.expiresAt) {
            // Ignore Prisma client types structurally deleting stale tokens
            await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });
            return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
        }

        // User is verified! Let's hash their new password
        const newPasswordHash = await bcrypt.hash(password, 12);

        // Update their account natively locking them inside the generic fetch loops
        await prisma.user.update({
            where: { email },
            data: { passwordHash: newPasswordHash },
        });

        // Cleanup the used token structurally securing against double-use attacks natively
        await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });

        return NextResponse.json({ success: true, message: "Security parameters successfully updated." }, { status: 200 });

    } catch (err) {
        console.error("Password Reset Exception Pipeline:", err);
        return NextResponse.json({ error: "Internal server validation failure." }, { status: 500 });
    }
}
