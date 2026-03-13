"use client";

import { useState, useEffect } from "react";
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
  const [trainerId, setTrainerId] = useState("");
  const [trainers, setTrainers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/admin/trainers")
      .then((r) => r.json())
      .then((data) => setTrainers(data.activeTrainers || []))
      .catch((err) => console.error(err));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trainerId) {
      toast({ title: "Validation Error", description: "Please select a trainer.", variant: "destructive" });
      return;
    }
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
          sessionDate: new Date(sessionDate || defaultDate).toISOString(),
          trainerId,
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
              <Label htmlFor="trainer">Trainer</Label>
              <select
                id="trainer"
                value={trainerId}
                onChange={(e) => setTrainerId(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300"
              >
                <option value="">Select a Trainer</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
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
