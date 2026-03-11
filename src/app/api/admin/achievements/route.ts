import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  studentId: z.string().cuid(),
  title: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const achievement = await prisma.achievement.create({
      data: {
        studentId: parsed.data.studentId,
        title: parsed.data.title,
        description: parsed.data.description,
      },
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create achievement" }, { status: 400 });
  }
}
