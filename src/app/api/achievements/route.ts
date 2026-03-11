import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.STUDENT) {
    return NextResponse.json({ achievements: [] });
  }

  const achievements = await prisma.achievement.findMany({
    where: { studentId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(achievements);
}
