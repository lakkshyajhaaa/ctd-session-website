import { z } from "zod";

export const createSessionSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  sessionType: z.enum(["ONLINE", "OFFLINE"]).default("ONLINE"),
  durationMinutes: z.number().min(1).max(480),
  sessionDate: z.string().datetime().or(z.date()),
  trainerId: z.string().min(1, "Trainer is required"),
});

export const registerSessionSchema = z.object({
  sessionId: z.string().cuid(),
});

export const verifyAttendanceSchema = z.object({
  sessionId: z.string().cuid(),
  code: z.string().length(6, "Code must be 6 characters"),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type VerifyAttendanceInput = z.infer<typeof verifyAttendanceSchema>;
