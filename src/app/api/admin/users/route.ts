import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  const where = role ? { role: role as Role } : {};

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      rollNumber: true,
      createdAt: true,
      _count: {
        select: {
          sessionRegistrations: true,
          attendances: {
            where: { status: "PRESENT" }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
