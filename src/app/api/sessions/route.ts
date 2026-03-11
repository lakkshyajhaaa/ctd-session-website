import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSessions, createSession } from "@/server/services/session.service";
import { createSessionSchema } from "@/lib/validations/session";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const trainerId = searchParams.get("trainerId");
  const studentId = searchParams.get("studentId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const sortBy = searchParams.get("sortBy") as "Date" | "Subject" | "Trainer" | null;

  const filters: Parameters<typeof getSessions>[0] = {};
  if (session.user.role === Role.TRAINER || session.user.role === Role.ADMIN) {
    if (trainerId) filters.trainerId = trainerId;
    else if (session.user.role === Role.TRAINER) filters.trainerId = session.user.id;
  }
  if (studentId) {
    filters.studentId = studentId;
  }
  if (from) filters.from = new Date(from);
  if (to) filters.to = new Date(to);
  if (sortBy) filters.sortBy = sortBy;

  const sessions = await getSessions(filters);

  if (session.user.role === Role.STUDENT) {
    const sessionIds = sessions.map((s) => s.id);
    const registrations = await prisma.sessionRegistration.findMany({
      where: {
        studentId: session.user.id,
        sessionId: { in: sessionIds },
      },
    });
    const attendances = await prisma.attendance.findMany({
      where: {
        studentId: session.user.id,
        sessionId: { in: sessionIds },
      },
    });

    const populatedSessions = sessions.map((s) => {
      const isRegistered = registrations.some((r) => r.sessionId === s.id);
      const att = attendances.find((a) => a.sessionId === s.id);
      return {
        ...s,
        isRegistered,
        attendanceStatus: att?.status || null,
      };
    });

    return NextResponse.json(populatedSessions);
  }

  return NextResponse.json(sessions);
}

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
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const newSession = await createSession(session.user.id, parsed.data);
    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create session";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
