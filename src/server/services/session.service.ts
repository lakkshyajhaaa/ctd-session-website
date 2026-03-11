import { prisma } from "@/lib/prisma";
import { SessionType } from "@prisma/client";
import { CreateSessionInput } from "@/lib/validations/session";

export async function createSession(trainerId: string, data: CreateSessionInput) {
  const sessionDate = typeof data.sessionDate === "string"
    ? new Date(data.sessionDate)
    : data.sessionDate;

  return prisma.session.create({
    data: {
      trainerId,
      subject: data.subject,
      topic: data.topic,
      sessionType: (data.sessionType as SessionType) || SessionType.ONLINE,
      durationMinutes: data.durationMinutes,
      sessionDate,
    },
  });
}

export async function getSessions(filters?: {
  trainerId?: string;
  studentId?: string;
  from?: Date;
  to?: Date;
  sortBy?: "Date" | "Subject" | "Trainer";
}) {
  const where: Record<string, unknown> = {};

  if (filters?.trainerId) {
    where.trainerId = filters.trainerId;
  }

  if (filters?.studentId) {
    where.registrations = {
      some: { studentId: filters.studentId },
    };
  }

  if (filters?.from || filters?.to) {
    where.sessionDate = {};
    if (filters.from) (where.sessionDate as Record<string, Date>).gte = filters.from;
    if (filters.to) (where.sessionDate as Record<string, Date>).lte = filters.to;
  }

  // default to sorting by newest dates
  let orderBy: any = { sessionDate: "desc" };

  if (filters?.sortBy === "Date") {
    orderBy = { sessionDate: "desc" };
  } else if (filters?.sortBy === "Subject") {
    orderBy = { subject: "asc" };
  } else if (filters?.sortBy === "Trainer") {
    orderBy = { trainer: { name: "asc" } };
  }

  return prisma.session.findMany({
    where,
    include: {
      trainer: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { registrations: true, attendances: true },
      },
    },
    orderBy,
  });
}

export async function getSessionById(id: string) {
  return prisma.session.findUnique({
    where: { id },
    include: {
      trainer: {
        select: { id: true, name: true, email: true },
      },
      registrations: {
        include: {
          student: {
            select: { id: true, name: true, email: true, rollNumber: true },
          },
        },
      },
      attendances: {
        include: {
          student: {
            select: { id: true, name: true, email: true, rollNumber: true },
          },
        },
      },
      notes: true,
    },
  });
}

export async function registerForSession(sessionId: string, studentId: string) {
  return prisma.sessionRegistration.upsert({
    where: {
      sessionId_studentId: { sessionId, studentId },
    },
    create: { sessionId, studentId },
    update: {},
  });
}
