import { Role, SessionType, AttendanceStatus } from "@prisma/client";

export type { Role, SessionType, AttendanceStatus };

export interface SessionWithRelations {
  id: string;
  subject: string;
  topic: string;
  sessionType: SessionType;
  durationMinutes: number;
  sessionDate: Date;
  trainer: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    registrations: number;
    attendances: number;
  };
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AttendanceCodePayload {
  code: string;
  expiresAt: Date;
  sessionId: string;
}
