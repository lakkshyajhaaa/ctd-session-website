"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Download } from "lucide-react";


const GRADIENTS = [
  { start: "#fb923c", end: "#facc15" }, // Orange to Yellow
  { start: "#8b5cf6", end: "#ec4899" }, // Purple to Pink
  { start: "#4ade80", end: "#2dd4bf" }, // Green to Teal
  { start: "#3b82f6", end: "#22d3ee" }, // Blue to Cyan
  { start: "#f43f5e", end: "#f97316" }, // Rose to Orange
];

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState<{
    totalStudyHours: number;
    sessionsAttended: number;
    attendanceRate: number;
    studyBySubject: Record<string, number>;
    studyByWeek: Record<string, number>;
    attendanceByMonth: Record<string, number>;
  } | null>(null);
  const [history, setHistory] = useState<{
    id: string;
    sessionDate: string;
    subject: string;
    topic: string;
    durationMinutes: number;
    status: string;
    verificationMethod: string;
  }[]>([]);
  const [dateRange, setDateRange] = useState<string>("all");

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  }, []);

  useEffect(() => {
    fetch(`/api/analytics/history?range=${dateRange}`)
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [dateRange]);

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ["Date", "Subject", "Topic", "Duration (mins)", "Status", "Verification"];
    const csvContent = [
      headers.join(","),
      ...history.map(row => [
        new Date(row.sessionDate).toLocaleDateString(),
        `"${row.subject}"`,
        `"${row.topic}"`,
        row.durationMinutes,
        row.status,
        row.verificationMethod
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_history_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!analytics) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Reports</h2>
        <Card className="animate-pulse">
          <CardContent className="h-64 pt-6" />
        </Card>
      </div>
    );
  }

  const totalStudyHours = Number(analytics.totalStudyHours) || 0;
  const sessionsAttended = Number(analytics.sessionsAttended) ?? 0;
  const attendanceRate = Number(analytics.attendanceRate) ?? 0;
  const studyBySubjectData = Object.entries(analytics.studyBySubject || {}).map(
    ([name, value]) => ({ name, value: Number(value) / 60 })
  );

  // Transform attendanceByMonth for Trend Chart
  const attendanceTrendData = Object.entries(analytics.attendanceByMonth || {}).map(
    ([month, rate]) => ({ month, rate: Number(rate) })
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reports</h2>
        <div className="flex gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-[180px] bg-neutral-900 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 hover:bg-neutral-800 transition-colors"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <Button onClick={handleExportCSV} variant="outline" className="border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 hover:text-white rounded-lg gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Study Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalStudyHours.toFixed(1)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessions Attended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sessionsAttended}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{attendanceRate.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#e5e7eb', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" domain={[0, 100]} tick={{ fill: '#e5e7eb', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderWidth: 1, padding: 10, borderRadius: 8 }}
                    itemStyle={{ color: "#e5e7eb" }}
                    labelStyle={{ color: "#ffffff" }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#111827', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-lg">Study by Subject (hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {GRADIENTS.map((grad, index) => (
                      <linearGradient key={`pieGrad-${index}`} id={`pieGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={grad.start} stopOpacity={1} />
                        <stop offset="100%" stopColor={grad.end} stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={studyBySubjectData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {studyBySubjectData.map((_, i) => (
                      <Cell key={i} fill={`url(#pieGrad-${i % GRADIENTS.length})`} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderWidth: 1, padding: 10, borderRadius: 8 }}
                    itemStyle={{ color: "#e5e7eb" }}
                    labelStyle={{ color: "#ffffff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Detailed Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">No session history found for this period.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-800 hover:bg-transparent">
                  <TableHead className="text-neutral-400">Date</TableHead>
                  <TableHead className="text-neutral-400">Subject</TableHead>
                  <TableHead className="text-neutral-400">Topic</TableHead>
                  <TableHead className="text-neutral-400">Duration</TableHead>
                  <TableHead className="text-neutral-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record.id} className="border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                    <TableCell className="font-medium text-neutral-300">
                      {new Date(record.sessionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-neutral-300">{record.subject}</TableCell>
                    <TableCell className="text-neutral-300 truncate max-w-[200px]">{record.topic}</TableCell>
                    <TableCell className="text-neutral-300">{record.durationMinutes}m</TableCell>
                    <TableCell>
                      {record.status === 'PRESENT' && <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 font-medium">Present</Badge>}
                      {record.status === 'ABSENT' && <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 font-medium">Absent</Badge>}
                      {record.status === 'LATE' && <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20 font-medium">Late</Badge>}
                      {record.status === 'UPCOMING' && <Badge variant="outline" className="text-neutral-500 border-neutral-700 bg-neutral-800 font-medium">Upcoming</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
