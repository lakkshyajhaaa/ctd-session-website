import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { updateNote } from "@/server/services/note.service";
import { Role } from "@prisma/client";
import { z } from "zod";

const schema = z.object({ content: z.string().min(1) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const note = await updateNote(
      id,
      parsed.data.content,
      session.user.id,
      session.user.role === Role.ADMIN
    );

    return NextResponse.json(note);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
