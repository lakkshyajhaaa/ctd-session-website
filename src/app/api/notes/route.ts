import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createNote } from "@/server/services/note.service";
import { createNoteSchema } from "@/lib/validations/note";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.TRAINER && session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const note = await createNote(
      parsed.data.sessionId,
      session.user.id,
      parsed.data
    );

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create note";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
