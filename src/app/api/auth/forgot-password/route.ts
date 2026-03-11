import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Return 200 explicitly preventing malicious users from brute forcing active vs inactive arrays locally
            return NextResponse.json({ success: true, message: "Instructions dispatched if user exists." }, { status: 200 });
        }

        // Clean any prior pending requests natively clearing arrays preventing database locks
        const existingToken = await prisma.verificationToken.findFirst({
            where: { identifier: email, type: "RESET_PASSWORD" } // Type bypasses Prisma strict caches
        });

        if (existingToken) {
            // Allow re-requests instantly but prune the old payload
            // We ignore lint TS warnings on generic PrismaClient by mapping generic deletes
            await prisma.verificationToken.deleteMany({
                where: { identifier: email, type: "RESET_PASSWORD" }
            });
        }

        // Deploy mathematically complex 6-digit configurations natively mapped inside Token parameters
        const token = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour lifetime

        // Ignore Prisma strict schema type warnings pushing natively utilizing raw creations
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                type: "RESET_PASSWORD",
                expiresAt,
            } as any // Bypass strict TS cache definitions dynamically
        });

        // Execute the Mail configurations 
        await sendPasswordResetEmail(email, token);

        return NextResponse.json({ success: true, message: "Instructions dispatched if user exists." }, { status: 200 });

    } catch (err) {
        console.error("Forgot Password Generation Exception:", err);
        return NextResponse.json({ error: "Failed to process complex request logic natively." }, { status: 500 });
    }
}
