import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { verifyAttendanceCode } from "@/server/services/attendance.service";
import { verifyAttendanceSchema } from "@/lib/validations/session";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.STUDENT) {
    return NextResponse.json({ error: "Only students can verify attendance" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = verifyAttendanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const attendance = await verifyAttendanceCode(
      parsed.data.sessionId,
      session.user.id,
      parsed.data.code.toUpperCase()
    );

    return NextResponse.json({
      success: true,
      attendance: {
        id: attendance.id,
        status: attendance.status,
        timestamp: attendance.timestamp,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
