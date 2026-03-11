import { prisma } from "@/lib/prisma";

export async function getStudentAnalytics(studentId: string) {
  const [studyLogs, attendances, achievements] = await Promise.all([
    prisma.studyLog.findMany({
      where: { studentId },
      include: {
        session: {
          select: { subject: true, sessionDate: true },
        },
      },
    }),
    prisma.attendance.findMany({
      where: { studentId },
      include: {
        session: {
          include: { trainer: true },
        },
      },
    }),
    prisma.achievement.findMany({
      where: { studentId },
    }),
  ]);

  const totalStudyHours = studyLogs.reduce((sum, log) => sum + log.durationMinutes, 0) / 60;

  const attendanceByMonth = attendances.reduce((acc, a) => {
    const month = a.session.sessionDate.toISOString().slice(0, 7);
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const studyBySubject = studyLogs.reduce((acc, log) => {
    const sub = log.session.subject;
    acc[sub] = (acc[sub] || 0) + log.durationMinutes;
    return acc;
  }, {} as Record<string, number>);

  const studyByWeek = studyLogs.reduce((acc, log) => {
    const d = new Date(log.session.sessionDate);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    acc[key] = (acc[key] || 0) + log.durationMinutes;
    return acc;
  }, {} as Record<string, number>);

  const registrations = await prisma.sessionRegistration.findMany({
    where: { studentId },
    select: { sessionId: true },
  });

  const registeredSessionIds = registrations.map(r => r.sessionId);

  // Fetch only the registered sessions that have actually occurred
  const completedSessions = await prisma.session.findMany({
    where: {
      id: { in: registeredSessionIds },
      sessionDate: { lt: new Date() },
    },
    select: { id: true },
  });

  const completedSessionIds = completedSessions.map(s => s.id);

  // Filter attendances to only those belonging to COMPLETED registered sessions with a PRESENT status
  const validAttendances = attendances.filter(a =>
    completedSessionIds.includes(a.sessionId) && a.status === "PRESENT"
  );

  const attendedByTrainer = validAttendances.reduce((acc, a) => {
    const trainerName = a.session.trainer?.name || "Unknown Trainer";
    acc[trainerName] = (acc[trainerName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const attendanceRate = completedSessionIds.length > 0
    ? Math.round((validAttendances.length / completedSessionIds.length) * 100)
    : 0;

  // Upcoming are registered sessions that aren't completed yet
  const upcomingSessionsCount = registeredSessionIds.length - completedSessionIds.length;

  return {
    totalStudyHours,
    sessionsAttended: validAttendances.length,
    attendanceRate,
    achievementsCount: achievements.length,
    achievements,
    studyBySubject,
    studyByWeek,
    attendanceByMonth,
    totalSessionsRegistered: registeredSessionIds.length,
    upcomingSessions: upcomingSessionsCount,
    attendedByTrainer,
  };
}

export async function getAdminAnalytics() {
  const [users, sessions, attendances] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
    prisma.session.count(),
    prisma.attendance.count(),
  ]);

  const userCounts = users.reduce((acc, u) => {
    acc[u.role] = u._count.id;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalUsers: users.reduce((s, u) => s + u._count.id, 0),
    totalSessions: sessions,
    totalAttendances: attendances,
    usersByRole: userCounts,
  };
}
