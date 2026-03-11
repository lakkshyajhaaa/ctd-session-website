"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { Plus, Calendar, BookOpen, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface Session {
  id: string;
  subject: string;
  topic: string;
  sessionType: string;
  durationMinutes: number;
  sessionDate: string;
  trainer: { name: string };
  _count: { registrations: number; attendances: number };
  isRegistered?: boolean;
  attendanceStatus?: string | null;
}

export default function SessionsPage() {
  const { data: sessionData } = useSession();
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"Date" | "Subject" | "Trainer">("Date");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Registered" | "Past">("Upcoming");

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const isTrainer = sessionData?.user?.role === Role.TRAINER || sessionData?.user?.role === Role.ADMIN;
  const isStudent = sessionData?.user?.role === Role.STUDENT;

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/sessions?sortBy=${sortBy}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setSessions(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => {
        setSessions([]);
        setIsLoading(false);
      });
  }, [sortBy]);

  // Derived filter logic
  const filteredSessions = sessions.filter((s) => {
    if (isTrainer) return true; // Trainers see all on their list

    const sessionDate = new Date(s.sessionDate);
    const now = new Date();
    const isPast = sessionDate < now;
    const isUpcoming = sessionDate > now;

    if (activeTab === "Upcoming") return isUpcoming && !s.isRegistered;
    if (activeTab === "Registered") return isUpcoming && s.isRegistered;
    if (activeTab === "Past") return isPast;

    return true;
  });

  const getStatusBadge = (s: Session) => {
    if (isTrainer) return null; // Trainers do not see personal states
    const isPast = new Date(s.sessionDate) < new Date();

    if (s.attendanceStatus === "PRESENT") {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Present</Badge>;
    }
    if (s.isRegistered && isPast && s.attendanceStatus !== "PRESENT") {
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Absent</Badge>;
    }
    if (s.isRegistered && !isPast) {
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Registered</Badge>;
    }
    if (!isPast) {
      return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Upcoming</Badge>;
    }
    return <Badge variant="outline" className="text-neutral-500 border-neutral-700 bg-neutral-800">Past</Badge>;
  };

  const handleRowDataClick = (s: Session) => {
    if (isTrainer) {
      router.push(`/dashboard/sessions/${s.id}`);
      return;
    }

    const isUpcoming = new Date(s.sessionDate) > new Date();
    if (isUpcoming && !s.isRegistered) {
      setSelectedSession(s); // Open strictly the registration modal
    } else {
      router.push(`/dashboard/sessions/${s.id}`);
    }
  };

  const executeRegistration = async () => {
    if (!selectedSession) return;
    setIsRegistering(true);
    try {
      const res = await fetch(`/api/sessions/${selectedSession.id}/register`, { method: "POST" });
      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) => s.id === selectedSession.id ? { ...s, isRegistered: true } : s)
        );
        setSelectedSession(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Sessions</h2>
          {isStudent && (
            <p className="text-sm text-muted-foreground mt-1">
              Browse incoming sessions to register or evaluate your completion history.
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center justify-between gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-1.5 shadow-sm min-w-[150px] transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-200">{sortBy}</span>
              </div>
            </button>

            {isSortOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsSortOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 w-full min-w-[150px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg flex flex-col p-1">
                  {["Date", "Subject", "Trainer"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option as any);
                        setIsSortOpen(false);
                      }}
                      className={`text-left w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${sortBy === option
                        ? "bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300"
                        : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-purple-600/20"
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {isTrainer && (
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <Link href="/dashboard/sessions/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Session
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isStudent && (
        <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800">
          {(["Upcoming", "Registered", "Past"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab
                ? "border-purple-500 text-purple-500 dark:text-purple-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Topic</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Date</TableHead>
                {isStudent && <TableHead>Status</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  {isStudent && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Topic</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Date</TableHead>
                {isStudent && <TableHead>Status</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((s) => (
                <TableRow
                  key={s.id}
                  className={isStudent ? "cursor-pointer hover:bg-neutral-800/50 transition-colors" : ""}
                  onClick={() => isStudent ? handleRowDataClick(s) : undefined}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{s.subject} - {s.topic}</span>
                      <span className="text-xs text-muted-foreground mt-1">{s.sessionType}</span>
                    </div>
                  </TableCell>
                  <TableCell>{s.trainer.name}</TableCell>
                  <TableCell>{s.durationMinutes} min</TableCell>
                  <TableCell>{new Date(s.sessionDate).toLocaleString()}</TableCell>
                  {isStudent && <TableCell>{getStatusBadge(s)}</TableCell>}
                  <TableCell className="text-right">
                    {isTrainer ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/sessions/${s.id}`}>
                          <Calendar className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowDataClick(s);
                        }}
                      >
                        {!!s.isRegistered ? "View" : "Register"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="No sessions found"
          description={isStudent ? "There are no sessions matching this filter criteria." : "Create your first session to start tracking attendance."}
          action={
            isTrainer ? (
              <Button asChild>
                <Link href="/dashboard/sessions/new">Create Session</Link>
              </Button>
            ) : null
          }
        />
      )}

      {selectedSession && (
        <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedSession.topic}</DialogTitle>
              <DialogDescription>
                Confirm your registration for this upcoming session.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 mt-2 border-y border-neutral-200 dark:border-neutral-800">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground col-span-1">Subject</span>
                <span className="text-sm font-semibold col-span-3">{selectedSession.subject}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground col-span-1">Trainer</span>
                <span className="text-sm font-semibold col-span-3">{selectedSession.trainer.name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground col-span-1">Date</span>
                <span className="text-sm font-semibold col-span-3">{new Date(selectedSession.sessionDate).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground col-span-1">Length</span>
                <span className="text-sm font-semibold col-span-3">{selectedSession.durationMinutes} minutes ({selectedSession.sessionType})</span>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setSelectedSession(null)}>Cancel</Button>
              <Button
                onClick={executeRegistration}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow"
                disabled={isRegistering}
              >
                {isRegistering ? "Registering..." : "Register"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
