"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface Session {
  id: string;
  subject: string;
  topic: string;
  sessionType: string;
  durationMinutes: number;
  sessionDate: string;
  _count: { registrations: number; attendances: number };
}

export function TrainerDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetch("/api/sessions", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]));
  }, []);

  const upcomingSessions = sessions
    .filter((s) => new Date(s.sessionDate) >= new Date())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Trainer Dashboard</h2>
        <Button asChild>
          <Link href="/dashboard/sessions/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Session
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {sessions.reduce((s, x) => s + x._count.registrations, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Student Attendance Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {sessions.reduce((s, x) => {
                const isToday = new Date(x.sessionDate).toDateString() === new Date().toDateString();
                return isToday ? s + x._count.attendances : s;
              }, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">No sessions yet. Create your first session to start tracking attendance.</p>
                <Button asChild variant="default" size="sm">
                  <Link href="/dashboard/sessions/new">Create Session</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 transition-all duration-150 hover:shadow-md bg-white dark:bg-neutral-900"
                  >
                    <div>
                      <p className="font-medium">{s.subject} - {s.topic}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(s.sessionDate).toLocaleString()} • {s.durationMinutes} min
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {s._count.registrations} registered
                      </Badge>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/sessions/${s.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Recent Session Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">No recent notes found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
