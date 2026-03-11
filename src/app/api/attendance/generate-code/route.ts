import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { generateAttendanceCode } from "@/server/services/attendance.service";
import { Role } from "@prisma/client";
import { z } from "zod";

const schema = z.object({ sessionId: z.string().cuid() });

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
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const result = await generateAttendanceCode(
      parsed.data.sessionId,
      session.user.id
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate code";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
