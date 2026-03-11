import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
        }

        const body = await request.json();
        const { code } = body;

        if (!code || typeof code !== "string" || code.length !== 6) {
            return NextResponse.json({ error: "Invalid verification code format." }, { status: 400 });
        }

        // Locate Verification Token mapped to active User Email natively
        const tokenRecord = await prisma.verificationToken.findUnique({
            where: {
                identifier_type: {
                    identifier: session.user.email,
                    type: "VERIFY_EMAIL",
                },
            },
        });

        if (!tokenRecord) {
            return NextResponse.json({ error: "No active verification requests found. Please request a new code." }, { status: 404 });
        }

        // Checking precise string signatures
        if (tokenRecord.token !== code) {
            return NextResponse.json({ error: "Incorrect verification code." }, { status: 400 });
        }

        // Evaluating mathematical expirations precisely
        if (new Date() > tokenRecord.expiresAt) {
            await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });
            return NextResponse.json({ error: "Your verification code has expired. Please request a new one." }, { status: 400 });
        }

        // Success! Update User object natively unlocking their entire dashboard suite arrays
        const verifiedTimestamp = new Date();
        await prisma.user.update({
            where: { email: session.user.email },
            data: { emailVerified: verifiedTimestamp },
        });

        // Cleanup the used token structurally securing against double-use arrays natively
        await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });

        return NextResponse.json({
            success: true,
            emailVerified: verifiedTimestamp.toISOString()
        }, { status: 200 });

    } catch (err) {
        console.error("Verification EndPoint Exception:", err);
        return NextResponse.json({ error: "Internal server validation failure." }, { status: 500 });
    }
}
