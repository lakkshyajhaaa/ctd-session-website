"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserX, UserSearch } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    rollNumber: string | null;
    createdAt: string;
    _count: {
        sessionRegistrations: number;
        attendances: number;
    };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filter, setFilter] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        setIsLoading(true);
        const url = filter ? `/api/admin/users?role=${filter}` : "/api/admin/users";
        fetch(url)
            .then((r) => r.json())
            .then((data) => {
                setUsers(Array.isArray(data) ? data : []);
                setIsLoading(false);
            })
            .catch(() => {
                setUsers([]);
                setIsLoading(false);
            });
    }, [filter]);

    async function deleteUser(id: string) {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
            if (res.ok) {
                setUsers((prev) => prev.filter((u) => u.id !== id));
                toast({ title: "User deleted", variant: "success" });
            } else {
                const data = await res.json();
                throw new Error(data.error);
            }
        } catch (err) {
            toast({
                title: "Delete failed",
                description: err instanceof Error ? err.message : "Unknown error",
                variant: "destructive",
            });
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "ADMIN":
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Admin</Badge>;
            case "TRAINER":
                return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Trainer</Badge>;
            case "STUDENT":
                return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Student</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Manage Users</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        View, filter, and manage organizational accounts and role assignments.
                    </p>
                </div>
            </div>

            <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800">
                {[
                    { id: "", label: "All Users" },
                    { id: "STUDENT", label: "Students" },
                    { id: "TRAINER", label: "Trainers" },
                    { id: "ADMIN", label: "Administrators" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${filter === tab.id
                            ? "border-purple-500 text-purple-500 dark:text-purple-400"
                            : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Roll Number</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Account Created</TableHead>
                            <TableHead>Total Attendance</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24 mt-2" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : users.length > 0 ? (
                            users.map((user) => {
                                let attendanceRate = 0;
                                if (user._count.sessionRegistrations > 0) {
                                    attendanceRate = Math.round((user._count.attendances / user._count.sessionRegistrations) * 100);
                                }

                                return (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-neutral-900 dark:text-neutral-100">{user.name}</span>
                                                <span className="text-xs text-muted-foreground mt-1">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-neutral-800 dark:text-neutral-200">{user.rollNumber || "—"}</span>
                                        </TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            {user.role === "STUDENT" ? (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{attendanceRate}%</span>
                                                    <span className="text-xs text-muted-foreground">{user._count.attendances} / {user._count.sessionRegistrations} Sessions</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <span className="sr-only">Open menu</span>
                                                        <span className="h-4 w-4">⋮</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[160px] bg-white dark:bg-neutral-900">
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        Edit Role
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600 focus:bg-red-100/50 cursor-pointer"
                                                        onClick={() => deleteUser(user.id)}
                                                    >
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
