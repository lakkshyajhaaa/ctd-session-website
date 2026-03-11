import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getStudentAnalytics, getAdminAnalytics } from "@/server/services/analytics.service";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === Role.ADMIN) {
    const analytics = await getAdminAnalytics();
    return NextResponse.json(analytics);
  }

  if (session.user.role === Role.STUDENT) {
    const analytics = await getStudentAnalytics(session.user.id);
    return NextResponse.json(analytics);
  }

  return NextResponse.json({ error: "Analytics not available for this role" }, { status: 403 });
}
