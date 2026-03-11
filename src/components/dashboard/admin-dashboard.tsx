"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<{
    totalUsers: number;
    totalSessions: number;
    totalAttendances: number;
    usersByRole: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  }, []);

  if (!analytics) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-4">
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

  const roleData = Object.entries(analytics.usersByRole || {}).map(([name, value]) => ({
    name,
    count: value,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h2>
        <Button asChild>
          <Link href="/admin">Manage Users</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.totalSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Attendances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.totalAttendances}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">Active</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all duration-150 hover:shadow-md p-2">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Users by Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#e5e7eb', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" tick={{ fill: '#e5e7eb', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderWidth: 1, padding: 10, borderRadius: 8 }}
                  itemStyle={{ color: "#e5e7eb" }}
                  labelStyle={{ color: "#ffffff" }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
