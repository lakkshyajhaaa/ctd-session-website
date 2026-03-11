import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSessionById } from "@/server/services/session.service";
import { Role } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sess = await getSessionById(id);

  if (!sess) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (
    session.user.role === Role.STUDENT &&
    !sess.registrations.some((r) => r.studentId === session.user.id)
  ) {
    return NextResponse.json({ error: "Not registered for this session" }, { status: 403 });
  }

  if (
    session.user.role === Role.TRAINER &&
    sess.trainerId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(sess);
}
