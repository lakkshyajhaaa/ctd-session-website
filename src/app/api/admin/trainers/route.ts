import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const [activeTrainers, pendingInvites] = await Promise.all([
            prisma.user.findMany({
                where: { role: Role.TRAINER },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    organization: true,
                    status: true,
                    createdAt: true,
                    _count: {
                        select: { sessionsAsTrainer: true }
                    }
                },
                orderBy: { createdAt: "desc" }
            }),
            prisma.trainerInvite.findMany({
                orderBy: { createdAt: "desc" }
            })
        ]);

        return NextResponse.json({ activeTrainers, pendingInvites });
    } catch (error) {
        console.error("Error fetching trainers:", error);
        return NextResponse.json(
            { error: "Failed to fetch trainers" },
            { status: 500 }
        );
    }
}
