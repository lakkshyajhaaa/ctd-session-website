import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
        }

        // Check if they are actually already verified locally
        if (session.user.emailVerified) {
            return NextResponse.json({ error: "Email is already verified locally." }, { status: 400 });
        }

        // Cleanup active unused tokens if they exist targeting this endpoint explicitly
        const existingToken = await prisma.verificationToken.findUnique({
            where: {
                identifier_type: {
                    identifier: session.user.email,
                    type: "VERIFY_EMAIL",
                },
            },
        });

        if (existingToken) {
            // Enforce a simple ratelimit ensuring tokens aren't hammered maliciously parsing timeouts natively
            const timeSinceCreation = Date.now() - existingToken.createdAt.getTime();
            if (timeSinceCreation < 60000) { // 60 seconds
                return NextResponse.json({ error: "Please wait at least 1 minute before requesting another code." }, { status: 429 });
            }
            await prisma.verificationToken.delete({ where: { id: existingToken.id } });
        }

        // Generatively deploy fresh logic natively
        const token = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.verificationToken.create({
            data: {
                identifier: session.user.email,
                token,
                type: "VERIFY_EMAIL",
                expiresAt,
            }
        });

        // Execute standard Mail transport 
        await sendVerificationEmail(session.user.email, token);

        return NextResponse.json({ success: true, message: "A new verfication code was successfully dispatched." }, { status: 200 });

    } catch (err) {
        console.error("Resend Validation Exception:", err);
        return NextResponse.json({ error: "Failed to dispatch structural verification payload." }, { status: 500 });
    }
}
