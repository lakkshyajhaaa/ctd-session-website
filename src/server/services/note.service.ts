import { prisma } from "@/lib/prisma";
import { CreateNoteInput } from "@/lib/validations/note";

export async function createNote(
  sessionId: string,
  trainerId: string,
  data: CreateNoteInput
) {
  const session = await prisma.session.findFirst({
    where: { id: sessionId, trainerId },
  });

  if (!session) {
    throw new Error("Session not found or unauthorized");
  }

  return prisma.note.create({
    data: {
      sessionId,
      trainerId,
      content: data.content,
    },
  });
}

export async function getSessionNotes(sessionId: string) {
  return prisma.note.findMany({
    where: { sessionId },
    include: {
      trainer: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateNote(
  noteId: string,
  content: string,
  userId: string,
  isAdmin: boolean
) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!note) throw new Error("Note not found");
  if (!isAdmin && note.trainerId !== userId) {
    throw new Error("Unauthorized to update this note");
  }

  return prisma.note.update({
    where: { id: noteId },
    data: { content },
  });
}
