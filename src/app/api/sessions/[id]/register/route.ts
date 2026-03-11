import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { registerForSession } from "@/server/services/session.service";
import { Role } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.STUDENT) {
    return NextResponse.json({ error: "Only students can register for sessions" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await registerForSession(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
