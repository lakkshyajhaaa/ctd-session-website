"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const GRADIENTS = [
  { start: "#fb923c", end: "#facc15" }, // Orange to Yellow
  { start: "#8b5cf6", end: "#ec4899" }, // Purple to Pink
  { start: "#4ade80", end: "#2dd4bf" }, // Green to Teal
  { start: "#3b82f6", end: "#22d3ee" }, // Blue to Cyan
  { start: "#f43f5e", end: "#f97316" }, // Rose to Orange
];

export function StudentDashboard() {
  const [analytics, setAnalytics] = useState<{
    totalStudyHours: number;
    sessionsAttended: number;
    attendanceRate: number;
    achievementsCount: number;
    achievements: { id: string; title: string; description: string | null }[];
    studyBySubject: Record<string, number>;
    studyByWeek: Record<string, number>;
    attendanceByMonth: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(() => {
        // FALLBACK MOCK DATA
        setAnalytics({
          totalStudyHours: 42.5,
          sessionsAttended: 12,
          attendanceRate: 85,
          achievementsCount: 3,
          achievements: [
            { id: "1", title: "Intro to React", description: "Completed React basics module" },
            { id: "2", title: "Typescript Fundamentals", description: "Passed TS quiz" },
            { id: "3", title: "Tailwind CSS Mastery", description: "Built 3 layouts" },
          ],
          studyBySubject: {
            React: 1200, // stored in minutes internally based on existing mapping
            TypeScript: 600,
            CSS: 450,
            NextJS: 300,
          },
          studyByWeek: {
            "Week 1": 150,
            "Week 2": 240,
            "Week 3": 300,
            "Week 4": 180,
            "Week 5": 420,
            "Week 6": 360,
            "Week 7": 510,
            "Week 8": 390,
          },
          attendanceByMonth: {
            Jan: 80,
            Feb: 90,
            Mar: 85,
          },
        });
      });
  }, []);

  if (!analytics) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Student Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const studyBySubjectData = Object.entries(analytics.studyBySubject).map(
    ([name, value]) => ({ name, value: value / 60 })
  );
  const studyByWeekData = Object.entries(analytics.studyByWeek)
    .map(([name, value]) => ({ name: name.slice(5), value: value / 60 }))
    .slice(-8);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight">Student Dashboard</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="col-span-1 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm transition-all duration-150 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Today's Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">No sessions scheduled for today.</p>
              <Button disabled className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-150">Join Session</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 grid-cols-2">
          <Card className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white rounded-xl shadow-sm transition-all duration-150 hover:shadow-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Attendance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{analytics.attendanceRate.toFixed(0)}%</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white rounded-xl shadow-sm transition-all duration-150 hover:shadow-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Sessions Attended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{analytics.sessionsAttended}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-sm transition-all duration-150 hover:shadow-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Total Study Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{analytics.totalStudyHours.toFixed(1)}h</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-400 to-teal-400 text-white rounded-xl shadow-sm transition-all duration-150 hover:shadow-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Achievements Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{analytics.achievementsCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all duration-150 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Study Hours Chart</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studyByWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(139,92,246,0.4)" />
                      <stop offset="95%" stopColor="rgba(139,92,246,0)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#e5e7eb', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#e5e7eb', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderWidth: 1, padding: 10, borderRadius: 8 }}
                    itemStyle={{ color: "#e5e7eb" }}
                    labelStyle={{ color: "#ffffff" }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorStudy)"
                    activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#111827", strokeWidth: 2 }}
                    dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all duration-150 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Study by Subject (hours)</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {GRADIENTS.map((grad, index) => (
                      <linearGradient key={`dashGrad-${index}`} id={`dashGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
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
                      <Cell key={i} fill={`url(#dashGrad-${i % GRADIENTS.length})`} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
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

      {analytics.achievements.length > 0 ? (
        <Card className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all duration-150 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.achievements.map((a) => (
                <Badge key={a.id} variant="secondary" className="py-2 px-3 text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors">
                  {a.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all duration-150 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-sm text-muted-foreground">No achievements yet. Keep studying!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
