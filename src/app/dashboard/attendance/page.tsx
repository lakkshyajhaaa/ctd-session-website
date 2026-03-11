"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle2, XCircle, Activity } from "lucide-react";

interface Session {
  id: string;
  subject: string;
  topic: string;
  sessionDate: string;
  attended: boolean;
  durationMinutes?: number;
}

export default function AttendancePage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetch("/api/attendance/history")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSessions(data);
        } else {
          // FALLBACK MOCK DATA to see UI in flow
          setSessions([
            { id: "1", subject: "React Native", topic: "Navigation", sessionDate: new Date(Date.now() - 86400000 * 1).toISOString(), attended: true, durationMinutes: 60 },
            { id: "2", subject: "Python Data Science", topic: "Pandas Intro", sessionDate: new Date(Date.now() - 86400000 * 3).toISOString(), attended: true, durationMinutes: 90 },
            { id: "3", subject: "System Design", topic: "Microservices", sessionDate: new Date(Date.now() - 86400000 * 5).toISOString(), attended: false, durationMinutes: 60 },
            { id: "4", subject: "Next.js Advanced", topic: "App Router", sessionDate: new Date(Date.now() - 86400000 * 7).toISOString(), attended: true, durationMinutes: 120 },
          ]);
        }
      })
      .catch(() => {
        setSessions([
          { id: "1", subject: "React Native", topic: "Navigation", sessionDate: new Date(Date.now() - 86400000 * 1).toISOString(), attended: true, durationMinutes: 60 },
          { id: "2", subject: "Python Data Science", topic: "Pandas Intro", sessionDate: new Date(Date.now() - 86400000 * 3).toISOString(), attended: true, durationMinutes: 90 },
          { id: "3", subject: "System Design", topic: "Microservices", sessionDate: new Date(Date.now() - 86400000 * 5).toISOString(), attended: false, durationMinutes: 60 },
          { id: "4", subject: "Next.js Advanced", topic: "App Router", sessionDate: new Date(Date.now() - 86400000 * 7).toISOString(), attended: true, durationMinutes: 120 },
        ]);
      });
  }, []);

  const totalAttended = sessions.filter((x) => x.attended).length;
  const totalSessions = sessions.length;
  const attendanceRate = totalSessions > 0 ? Math.round((totalAttended / totalSessions) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Attendance Record</h2>
        <p className="text-sm text-muted-foreground mt-1">Review your historical session attendance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-orange-400 to-yellow-400 text-white shadow-md border-0 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Total Sessions Attended
            </CardTitle>
            <Activity className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAttended}</div>
            <p className="text-xs text-white/80 mt-1">
              Out of {totalSessions} total scheduled
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md border-0 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Attendance Rate
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-white/80 mt-1">
              Overall participation
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Session History</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sessions recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950 transition-all duration-150 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-900 group"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-base group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                      {s.subject} <span className="text-muted-foreground font-normal mx-1">—</span> {s.topic}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground gap-4 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(s.sessionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(s.sessionDate).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                        {s.durationMinutes && ` (${s.durationMinutes}m)`}
                      </div>
                    </div>
                  </div>
                  <div>
                    {s.attended ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0 flex items-center gap-1.5 py-1 px-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Present
                      </Badge>
                    ) : (
                      <Badge className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 border-0 flex items-center gap-1.5 py-1 px-2.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Absent
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
