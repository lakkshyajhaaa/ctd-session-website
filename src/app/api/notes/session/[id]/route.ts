import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSessionNotes } from "@/server/services/note.service";
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
    include: {
      registrations: { where: { studentId: session.user.id } },
    },
  });

  if (!sess) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const isTrainer = sess.trainerId === session.user.id;
  const isRegistered = sess.registrations.length > 0;
  const isAdmin = session.user.role === "ADMIN";

  if (!isTrainer && !isRegistered && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const notes = await getSessionNotes(id);
  return NextResponse.json(notes);
}
