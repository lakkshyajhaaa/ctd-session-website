import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.studyLog.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.sessionRegistration.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const mockPassword = await hash("Test1234!", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Global Administrator",
      email: "admin@ctd.edu",
      passwordHash: mockPassword,
      role: "ADMIN",
    },
  });

  const trainer = await prisma.user.create({
    data: {
      name: "Sarah (Lead Trainer)",
      email: "trainer@ctd.edu",
      passwordHash: mockPassword,
      role: "TRAINER",
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Alex (Student)",
      email: "student@ctd.edu",
      passwordHash: mockPassword,
      role: "STUDENT",
    },
  });

  // Create Mock Sessions
  const sessionData = [
    { subject: "React Native", topic: "Advanced Navigation", durationMinutes: 90, daysOffset: -10, attended: true },
    { subject: "System Design", topic: "Microservices Architecture", durationMinutes: 120, daysOffset: -8, attended: true },
    { subject: "TypeScript", topic: "Generics and Utility Types", durationMinutes: 60, daysOffset: -7, attended: true },
    { subject: "CSS", topic: "Tailwind Grid & Flexbox", durationMinutes: 90, daysOffset: -5, attended: true },
    { subject: "NextJS", topic: "App Router Deep Dive", durationMinutes: 120, daysOffset: -3, attended: true },
    { subject: "React", topic: "Server Components", durationMinutes: 90, daysOffset: -1, attended: false }, // Missed session
    { subject: "Node.js", topic: "Event Loop & Async", durationMinutes: 120, daysOffset: 1, attended: false }, // Tomorrow
    { subject: "System Design", topic: "Caching Strategies", durationMinutes: 90, daysOffset: 3, attended: false },
    { subject: "Data Structures", topic: "Graphs & Trees", durationMinutes: 120, daysOffset: 5, attended: false },
    { subject: "Algorithms", topic: "Dynamic Programming", durationMinutes: 120, daysOffset: 7, attended: false },
    { subject: "React Native", topic: "Animations & Gestures", durationMinutes: 90, daysOffset: 10, attended: false },
    { subject: "CSS", topic: "Advanced Animations", durationMinutes: 60, daysOffset: 12, attended: false },
  ];

  const sessions = [];
  for (const s of sessionData) {
    const session = await prisma.session.create({
      data: {
        trainerId: trainer.id,
        subject: s.subject,
        topic: s.topic,
        sessionType: "ONLINE",
        durationMinutes: s.durationMinutes,
        sessionDate: new Date(Date.now() + 86400000 * s.daysOffset),
      }
    });
    sessions.push({ ...session, meta: s });
  }

  // Register Student logic
  await prisma.sessionRegistration.createMany({
    data: sessions.map(s => ({ sessionId: s.id, studentId: student.id }))
  });

  // Add Attendance & Study Logs for attended sessions
  for (const s of sessions) {
    if (s.meta.attended) {
      await prisma.attendance.create({
        data: {
          sessionId: s.id,
          studentId: student.id,
          status: "PRESENT",
          verificationMethod: "MANUAL"
        }
      });

      await prisma.studyLog.create({
        data: {
          studentId: student.id,
          sessionId: s.id,
          durationMinutes: s.meta.durationMinutes,
        }
      });
    }
  }

  console.log("Mock Environment Seeded Successfully!");
  console.log("---");
  console.log("ALL ACCOUNTS PASSWORD: Test1234!");
  console.log("Admin Email:", admin.email);
  console.log("Trainer Email:", trainer.email);
  console.log("Student Email:", student.email);
  console.log("---");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
