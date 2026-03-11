import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateRandomCode } from "@/lib/utils";

const CODE_EXPIRY_SECONDS = 20;

// In-memory rate limit: studentId -> { count, resetAt }
const codeAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS = 5;

function checkRateLimit(studentId: string): boolean {
  const now = Date.now();
  const record = codeAttempts.get(studentId);

  if (!record) {
    codeAttempts.set(studentId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > record.resetAt) {
    codeAttempts.set(studentId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_ATTEMPTS) return false;
  record.count++;
  return true;
}

export async function generateAttendanceCode(sessionId: string, trainerId: string) {
  const session = await prisma.session.findFirst({
    where: { id: sessionId, trainerId },
  });

  if (!session) {
    throw new Error("Session not found or unauthorized");
  }

  const code = generateRandomCode(6);
  const codeHash = await hash(code, 10);
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_SECONDS * 1000);

  await prisma.attendanceCode.create({
    data: {
      sessionId,
      codeHash,
      expiresAt,
    },
  });

  return { code, expiresAt, sessionId };
}

export async function verifyAttendanceCode(
  sessionId: string,
  studentId: string,
  code: string
) {
  if (!checkRateLimit(studentId)) {
    throw new Error("Too many attempts. Please try again later.");
  }

  const registration = await prisma.sessionRegistration.findUnique({
    where: {
      sessionId_studentId: { sessionId, studentId },
    },
  });

  if (!registration) {
    throw new Error("You are not registered for this session");
  }

  const validCode = await prisma.attendanceCode.findFirst({
    where: {
      sessionId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!validCode) {
    throw new Error("No valid attendance code. Code may have expired.");
  }

  const isValid = await compare(code, validCode.codeHash);
  if (!isValid) {
    throw new Error("Invalid attendance code");
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  const attendance = await prisma.attendance.upsert({
    where: {
      sessionId_studentId: { sessionId, studentId },
    },
    create: {
      sessionId,
      studentId,
      status: "PRESENT",
      verificationMethod: "CODE",
    },
    update: {
      status: "PRESENT",
      verificationMethod: "CODE",
      timestamp: new Date(),
    },
  });

  await prisma.studyLog.upsert({
    where: {
      studentId_sessionId: { studentId, sessionId },
    },
    create: {
      studentId,
      sessionId,
      durationMinutes: session?.durationMinutes ?? 0,
    },
    update: {
      durationMinutes: session?.durationMinutes ?? 0,
    },
  });

  return attendance;
}

export async function getSessionAttendance(sessionId: string) {
  return prisma.attendance.findMany({
    where: { sessionId },
    include: {
      student: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}
