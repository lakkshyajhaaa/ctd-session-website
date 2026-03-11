import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.STUDENT) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const registrations = await prisma.sessionRegistration.findMany({
    where: { studentId: session.user.id },
    include: {
      session: {
        select: {
          id: true,
          subject: true,
          topic: true,
          sessionDate: true,
        },
      },
    },
  });

  const attendances = await prisma.attendance.findMany({
    where: { studentId: session.user.id },
    select: { sessionId: true },
  });
  const attendedSet = new Set(attendances.map((a) => a.sessionId));

  const history = registrations.map((r) => ({
    ...r.session,
    attended: attendedSet.has(r.session.id),
  }));

  return NextResponse.json(history);
}
