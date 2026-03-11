"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Session {
  id: string;
  subject: string;
  topic: string;
  sessionDate: string;
}

export default function NotesPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetch("/api/sessions", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Notes</h2>

      <Card>
        <CardHeader>
          <CardTitle>Sessions with Notes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on a session to view its notes
          </p>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground">No sessions yet</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((s) => (
                <Button key={s.id} asChild variant="outline" className="w-full justify-start">
                  <Link href={`/dashboard/sessions/${s.id}#notes`}>
                    {s.subject} - {s.topic} • {new Date(s.sessionDate).toLocaleString()}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
