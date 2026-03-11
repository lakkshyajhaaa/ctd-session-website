import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function PATCH(request: Request, context: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== Role.TRAINER && session.user.role !== Role.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { id } = context.params;
        const body = await request.json();
        const { attendanceOpen } = body;

        if (typeof attendanceOpen !== "boolean") {
            return NextResponse.json({ error: "attendanceOpen must be a boolean" }, { status: 400 });
        }

        const targetSession = await prisma.session.findUnique({ where: { id } });

        if (!targetSession || (targetSession.trainerId !== session.user.id && session.user.role !== Role.ADMIN)) {
            return NextResponse.json({ error: "Forbidden or Not Found" }, { status: 403 });
        }

        const updatedSession = await prisma.session.update({
            where: { id },
            data: { attendanceOpen },
        });

        return NextResponse.json(updatedSession);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update attendance status" }, { status: 500 });
    }
}
