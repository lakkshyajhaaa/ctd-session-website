import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSessionAttendance } from "@/server/services/attendance.service";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sess = await prisma.session.findUnique({
    where: { id },
    select: { trainerId: true },
  });

  if (!sess) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (
    session.user.role !== Role.ADMIN &&
    session.user.role !== Role.TRAINER &&
    sess.trainerId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const attendances = await getSessionAttendance(id);
  return NextResponse.json(attendances);
}
