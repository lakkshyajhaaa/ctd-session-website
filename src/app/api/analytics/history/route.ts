import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const range = searchParams.get("range") || "all";

        // Construct Date Filters
        const dateFilter: { gte?: Date } = {};
        if (range === "7days") {
            dateFilter.gte = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        } else if (range === "30days") {
            dateFilter.gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }

        if (session.user.role === Role.STUDENT) {
            // Find all sessions the student registered for
            const registrations = await prisma.sessionRegistration.findMany({
                where: { studentId: session.user.id },
                include: {
                    session: true
                }
            });

            // Filter by requested date range natively in JS to simplify since we query the parent relation
            let filteredRegistrations = registrations;
            if (dateFilter.gte) {
                filteredRegistrations = registrations.filter(r => new Date(r.session.sessionDate).getTime() >= dateFilter.gte!.getTime());
            }

            // Intersect with Attendances
            const attendances = await prisma.attendance.findMany({
                where: { studentId: session.user.id }
            });

            const history = filteredRegistrations.map(reg => {
                const attendanceRecord = attendances.find(a => a.sessionId === reg.session.id);

                let status = "ABSENT";
                if (attendanceRecord) {
                    status = attendanceRecord.status;
                } else if (new Date(reg.session.sessionDate) > new Date()) {
                    status = "UPCOMING";
                }

                return {
                    id: reg.session.id,
                    sessionDate: reg.session.sessionDate,
                    subject: reg.session.subject,
                    topic: reg.session.topic,
                    durationMinutes: reg.session.durationMinutes,
                    status: status,
                    verificationMethod: attendanceRecord?.verificationMethod || "NONE"
                };
            });

            // Sort chronological descending
            history.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());

            return NextResponse.json(history);
        }

        // Admins could conceptually see global histories, but we scope this feature to the requester context for now
        return NextResponse.json({ error: "History view only available to students currently" }, { status: 403 });

    } catch (error) {
        console.error("Error fetching analytics history:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
