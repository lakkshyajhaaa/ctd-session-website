"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function NewSessionPage() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [sessionType, setSessionType] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [sessionDate, setSessionDate] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          sessionType,
          durationMinutes,
          sessionDate: new Date(sessionDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create session");
      }

      const session = await res.json();
      toast({
        title: "Session created",
        description: "Your session has been created successfully.",
        variant: "success",
      });
      router.push(`/dashboard/sessions/${session.id}`);
      router.refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const defaultDate = new Date();
  defaultDate.setMinutes(defaultDate.getMinutes() - defaultDate.getTimezoneOffset());
  const dateStr = defaultDate.toISOString().slice(0, 16);

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-bold">Create Session</h2>
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g. Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g. Algebra Basics"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Session Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sessionType"
                    value="ONLINE"
                    checked={sessionType === "ONLINE"}
                    onChange={() => setSessionType("ONLINE")}
                  />
                  Online
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sessionType"
                    value="OFFLINE"
                    checked={sessionType === "OFFLINE"}
                    onChange={() => setSessionType("OFFLINE")}
                  />
                  Offline
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionDate">Date & Time</Label>
              <Input
                id="sessionDate"
                type="datetime-local"
                value={sessionDate || dateStr}
                onChange={(e) => setSessionDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Session"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
