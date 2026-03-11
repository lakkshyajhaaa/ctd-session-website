"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { QrCode, FileText, Download } from "lucide-react";

interface SessionDetail {
  id: string;
  subject: string;
  topic: string;
  sessionType: string;
  durationMinutes: number;
  sessionDate: string;
  attendanceOpen: boolean;
  trainer: { name: string; email: string };
  registrations: { student: { name: string; email: string; rollNumber: string | null; } }[];
  attendances: { student: { name: string; email: string; rollNumber: string | null; }; status: string }[];
  notes: { id: string; content: string; createdAt: string }[];
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<SessionDetail | null>(null);
  const [attendanceCode, setAttendanceCode] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "rollNumber">("name");

  // Timer State
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const { toast } = useToast();

  const id = params.id as string;
  const isTrainer = session?.user?.role === Role.TRAINER || session?.user?.role === Role.ADMIN;
  const isStudent = session?.user?.role === Role.STUDENT;
  const isRegistered = data?.registrations?.some(
    (r) => r.student.email === session?.user?.email
  );

  useEffect(() => {
    fetch(`/api/sessions/${id}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [id]);

  useEffect(() => {
    if (!data?.attendanceOpen) {
      setTimeLeft(300); // Reset when closed
      return;
    }

    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.attendanceOpen, timeLeft]);

  const downloadCSV = () => {
    if (!data?.attendances) return;
    const headers = ["Name,Email,Roll Number,Status"];
    const rows = data.attendances.map(a =>
      `"${a.student.name}","${a.student.email}","${a.student.rollNumber || ""}","${a.status}"`
    );
    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_${data.topic.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isUrgent = timeLeft > 0 && timeLeft < 60;
  const isExpired = timeLeft <= 0;

  async function generateCode() {
    try {
      const res = await fetch("/api/attendance/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      });
      const json = await res.json();
      if (res.ok) {
        setAttendanceCode(json.code);
        toast({
          title: "Code generated",
          description: `Code expires in 20 seconds: ${json.code}`,
          variant: "success",
        });
      } else throw new Error(json.error);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to generate code",
        variant: "destructive",
      });
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/attendance/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, code: codeInput.toUpperCase() }),
      });
      const json = await res.json();
      if (res.ok) {
        toast({
          title: "Attendance verified!",
          description: "Your attendance has been recorded.",
          variant: "success",
        });
        setCodeInput("");
        setData((prev) =>
          prev
            ? {
              ...prev,
              attendances: [
                ...prev.attendances,
                {
                  student: {
                    name: session?.user?.name ?? "",
                    email: session?.user?.email ?? "",
                    rollNumber: null, // hydrated via local mock
                  },
                  status: "PRESENT",
                },
              ],
            }
            : null
        );
      } else throw new Error(json.error);
    } catch (err) {
      toast({
        title: "Verification failed",
        description: err instanceof Error ? err.message : "Invalid code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function registerForSession() {
    try {
      const res = await fetch(`/api/sessions/${id}/register`, {
        method: "POST",
      });
      if (res.ok) {
        toast({ title: "Registered!", variant: "success" });
        router.refresh();
        if (data) {
          setData({
            ...data,
            registrations: [
              ...data.registrations,
              {
                student: {
                  name: session?.user?.name ?? "",
                  email: session?.user?.email ?? "",
                  rollNumber: null,
                },
              },
            ],
          });
        }
      } else throw new Error();
    } catch {
      toast({
        title: "Registration failed",
        variant: "destructive",
      });
    }
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, content: noteContent }),
      });
      if (res.ok) {
        const note = await res.json();
        setData((prev) =>
          prev ? { ...prev, notes: [note, ...prev.notes] } : null
        );
        setNoteContent("");
        toast({ title: "Note added", variant: "success" });
      } else throw new Error();
    } catch {
      toast({ title: "Failed to add note", variant: "destructive" });
    }
  }

  async function toggleAttendance(status: boolean) {
    try {
      const res = await fetch(`/api/sessions/${id}/attendance-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceOpen: status }),
      });
      if (res.ok) {
        setData((prev) => (prev ? { ...prev, attendanceOpen: status } : null));
        toast({
          title: status ? "Attendance Opened" : "Attendance Closed",
          variant: "success",
        });
      } else throw new Error();
    } catch {
      toast({
        title: "Failed to update attendance status",
        variant: "destructive",
      });
    }
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{data?.subject} - {data?.topic}</h2>
          <p className="text-muted-foreground">
            {data?.trainer?.name} • {new Date(data?.sessionDate ?? "").toLocaleString()} • {data?.durationMinutes} min
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data.attendanceOpen && (
            <Badge variant="outline" className="border-orange-500 text-orange-500 animate-pulse">
              Attendance Open
            </Badge>
          )}
          <Badge>{data.sessionType}</Badge>
        </div>
      </div>

      {isStudent && !isRegistered && (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={registerForSession}>Register for this session</Button>
          </CardContent>
        </Card>
      )}

      {isTrainer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Attendance Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {!data.attendanceOpen ? (
                <Button
                  onClick={() => toggleAttendance(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Start Attendance
                </Button>
              ) : (
                <Button
                  onClick={() => toggleAttendance(false)}
                  variant="destructive"
                >
                  Close Attendance
                </Button>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-muted-foreground mb-4">Generate a verification code for manual entry:</p>
              <Button onClick={generateCode} variant="outline">Generate Code</Button>
              {attendanceCode && (
                <p className="mt-4 text-2xl font-mono font-bold tracking-widest text-purple-600 dark:text-purple-400">
                  {attendanceCode}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isStudent && isRegistered && (
        <Card className={data.attendanceOpen ? "border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-all duration-300" : ""}>
          <CardHeader>
            <CardTitle>Submit Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {data.attendanceOpen ? (
              <div className="space-y-6">
                <div className={`flex flex-col items-center justify-center py-6 rounded-lg border transition-colors ${isExpired ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50" :
                  isUrgent ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50" :
                    "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50"
                  }`}>
                  <span className={`text-sm font-medium mb-2 uppercase tracking-wider ${isExpired || isUrgent ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"
                    }`}>
                    {isExpired ? "Attendance Closed" : "Time Remaining"}
                  </span>

                  <div className={`text-4xl font-bold tabular-nums ${isExpired ? "text-red-500 opacity-50" :
                    isUrgent ? "text-red-500 animate-pulse" :
                      "text-orange-500"
                    }`}>
                    {formattedTime}
                  </div>

                  {!isExpired && (
                    <div className="w-full max-w-xs mt-4 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${isUrgent ? 'bg-red-500' : 'bg-orange-500'}`}
                        style={{ width: `${(timeLeft / 300) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                <form onSubmit={verifyCode} className="flex gap-2 max-w-sm mx-auto">
                  <Input
                    placeholder="6-character code"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase().slice(0, 6))}
                    maxLength={6}
                    disabled={loading || isExpired}
                    className="font-mono text-center tracking-widest uppercase text-lg h-12"
                  />
                  <Button
                    type="submit"
                    disabled={loading || codeInput.length !== 6 || isExpired}
                    className="h-12 px-8"
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <p>Attendance closed by trainer.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isTrainer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Add Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addNote} className="space-y-2">
              <textarea
                className="w-full min-h-[100px] rounded-md border px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"
                placeholder="Session notes..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
              <Button type="submit">Add Note</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.notes?.length === 0 ? (
            <p className="text-muted-foreground">No notes yet</p>
          ) : (
            <div className="space-y-4">
              {data?.notes?.map((n) => (
                <div key={n.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
                  <p className="text-sm">{n.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isTrainer && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Attendance ({data?.attendances?.length ?? 0})</CardTitle>
            <div className="flex gap-2 text-sm flex-wrap justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCSV}
                className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant={sortBy === "name" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSortBy("name")}
              >
                Name
              </Button>
              <Button
                variant={sortBy === "rollNumber" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSortBy("rollNumber")}
              >
                Roll Number
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data?.attendances?.length === 0 ? (
              <p className="text-muted-foreground">No attendances yet</p>
            ) : (
              <div className="space-y-2">
                {[...(data?.attendances || [])].sort((a, b) => {
                  if (sortBy === "name") {
                    return a.student.name.localeCompare(b.student.name);
                  } else {
                    const rollA = a.student.rollNumber || "";
                    const rollB = b.student.rollNumber || "";
                    return rollA.localeCompare(rollB);
                  }
                }).map((a, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800"
                  >
                    <div>
                      <p className="font-medium">{a.student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.student.rollNumber ?? a.student.email}
                      </p>
                    </div>
                    <Badge variant="outline" className="mt-2 sm:mt-0 bg-green-500/10 text-green-500 border-green-500/20">
                      {a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
