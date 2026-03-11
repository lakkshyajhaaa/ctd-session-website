"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Calendar, Zap, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface ProgressAnalytics {
    totalStudyHours: number;
    sessionsAttended: number;
    attendanceRate: number;
    achievementsCount: number;
    totalSessionsRegistered: number;
    upcomingSessions: number;
    attendedByTrainer: Record<string, number>;
}

const PIE_COLORS = ["#8b5cf6", "#f43f5e", "#ffb224", "#3b82f6", "#2dd4bf"];
const BAR_COLOR = "#8b5cf6";

export default function ProgressPage() {
    const [data, setData] = useState<ProgressAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/analytics")
            .then((res) => res.json())
            .then((json) => {
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading || !data) {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[250px]" />
                    <Skeleton className="h-4 w-[400px]" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-[120px] w-full rounded-xl" />
                    <Skeleton className="h-[120px] w-full rounded-xl" />
                    <Skeleton className="h-[120px] w-full rounded-xl" />
                    <Skeleton className="h-[120px] w-full rounded-xl" />
                </div>
            </div>
        );
    }

    const trainerChartData = Object.entries(data.attendedByTrainer || {}).map(([name, count]) => ({
        name,
        attended: count
    }));

    const pieData = [
        { name: "Attended", value: data.attendanceRate },
        { name: "Missed", value: 100 - data.attendanceRate }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Learning Progress</h1>
                <p className="text-neutral-500 mt-2">Track your session attendance trends and completion milestones over time.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Core Metric 1: Total Registered */}
                <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                            Total Sessions
                        </CardTitle>
                        <BookOpenIcon className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                            {data.totalSessionsRegistered}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                            Registered over all time
                        </p>
                    </CardContent>
                </Card>

                {/* Core Metric 2: Attended */}
                <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 dark:bg-green-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                            Sessions Attended
                        </CardTitle>
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                            {data.sessionsAttended}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                            Successfully validated
                        </p>
                    </CardContent>
                </Card>

                {/* Core Metric 3: Percentage */}
                <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                            Attendance Rate
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                            {data.attendanceRate}%
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                            Across completed sessions
                        </p>
                    </CardContent>
                </Card>

                {/* Core Metric 4: Upcoming */}
                <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 dark:bg-orange-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                            Upcoming Sessions
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                            {data.upcomingSessions}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                            Pending attendance
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Sessions Attended by Trainer</CardTitle>
                        <CardDescription>Breakdown of your participation globally</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {trainerChartData.length === 0 ? (
                            <div className="h-[300px] flex items-center justify-center text-sm text-neutral-500">
                                No attendance tracked yet.
                            </div>
                        ) : (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trainerChartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.3} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", color: "#fff", borderRadius: "8px" }}
                                            cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
                                        />
                                        <Bar dataKey="attended" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Overall Track Completion</CardTitle>
                        <CardDescription>Your aggregated attendance mapped out</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                        {data.totalSessionsRegistered === 0 ? (
                            <div className="h-[300px] flex items-center justify-center text-sm text-neutral-500">
                                Register for sessions to calculate track completion.
                            </div>
                        ) : (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={110}
                                            fill="#8884d8"
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", color: "#fff", borderRadius: "8px" }}
                                            formatter={(value: number) => [`${value}%`, "Rate"]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex gap-4 items-center justify-center mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
                                        <span className="text-xs text-neutral-500 font-medium">Attended</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#f43f5e]" />
                                        <span className="text-xs text-neutral-500 font-medium">Missed</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}
