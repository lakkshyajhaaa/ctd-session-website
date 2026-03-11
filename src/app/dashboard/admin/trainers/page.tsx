"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users, Mail, Building, Link2, Copy, CheckCircle2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Trainer {
    id: string;
    name: string;
    email: string;
    organization: string | null;
    status: string;
    createdAt: string;
    _count: {
        sessionsAsTrainer: number;
    };
}

interface TrainerInvite {
    id: string;
    email: string;
    organization: string | null;
    token: string;
    status: string;
    createdAt: string;
    expiresAt: string;
}

export default function AdminTrainersPage() {
    const [activeTrainers, setActiveTrainers] = useState<Trainer[]>([]);
    const [pendingInvites, setPendingInvites] = useState<TrainerInvite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteOrg, setInviteOrg] = useState("");
    const [isInviting, setIsInviting] = useState(false);

    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/trainers");
            if (res.ok) {
                const data = await res.json();
                setActiveTrainers(data.activeTrainers || []);
                setPendingInvites(data.pendingInvites || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            const res = await fetch("/api/admin/trainers/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail, organization: inviteOrg }),
            });
            const data = await res.json();

            if (res.ok) {
                toast({ title: "Invite Generated", variant: "success" });
                setGeneratedLink(data.inviteLink);
                fetchData(); // refresh list
            } else {
                toast({ title: "Failed to invite", description: data.error, variant: "destructive" });
            }
        } catch (err) {
            toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
        } finally {
            setIsInviting(false);
        }
    };

    const handleCopy = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({ title: "Copied to clipboard", variant: "default" });
        }
    };

    const resetModal = () => {
        setIsInviteModalOpen(false);
        setInviteEmail("");
        setInviteOrg("");
        setGeneratedLink(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Manage Trainers</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Invite new trainers to the portal and manage existing instructor accounts.
                    </p>
                </div>
                <Button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Trainer
                </Button>
            </div>

            <Dialog open={isInviteModalOpen} onOpenChange={(open) => !open && resetModal()}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle>Invite New Trainer</DialogTitle>
                        <DialogDescription>
                            Generate a unique registration link to securely onboard a new instructor.
                        </DialogDescription>
                    </DialogHeader>

                    {!generatedLink ? (
                        <form onSubmit={handleInvite} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        placeholder="trainer@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="pl-9 bg-neutral-100 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="org" className="text-sm font-medium">Organization / Company (Optional)</Label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                                    <Input
                                        id="org"
                                        type="text"
                                        placeholder="E.g. Microsoft, Freelance API Expert"
                                        value={inviteOrg}
                                        onChange={(e) => setInviteOrg(e.target.value)}
                                        className="pl-9 bg-neutral-100 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={resetModal} disabled={isInviting}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isInviting} className="bg-purple-600 hover:bg-purple-700 text-white">
                                    {isInviting ? "Generating..." : "Generate Link"}
                                </Button>
                            </DialogFooter>
                        </form>
                    ) : (
                        <div className="space-y-4 py-4">
                            <div className="rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 p-4 flex gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-green-800 dark:text-green-400">Invite Generated Successfully</h4>
                                    <p className="text-sm text-green-600 dark:text-green-500/80 mt-1">
                                        Send this link to the trainer. It will expire in 7 days.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 mt-2">
                                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Registration Link</Label>
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        value={generatedLink}
                                        className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"
                                    />
                                    <Button variant="secondary" onClick={handleCopy} className="shrink-0 flex items-center gap-2">
                                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? "Copied" : "Copy"}
                                    </Button>
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button onClick={resetModal} className="w-full">Done</Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Pending Invitations</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : pendingInvites.length === 0 ? (
                        <div className="text-center py-8">
                            <Mail className="h-8 w-8 text-neutral-400 mx-auto mb-3 opacity-50" />
                            <p className="text-neutral-500">No pending trainer invitations.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-neutral-50 dark:bg-neutral-900/50">
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Organization</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Expires</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingInvites.map((invite) => (
                                        <TableRow key={invite.id}>
                                            <TableCell className="font-medium">{invite.email}</TableCell>
                                            <TableCell className="text-muted-foreground">{invite.organization || "—"}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    invite.status === "PENDING" ? "text-orange-500 border-orange-500/20 bg-orange-500/10" :
                                                        invite.status === "ACCEPTED" ? "text-green-500 border-green-500/20 bg-green-500/10" :
                                                            "text-red-500 border-red-500/20 bg-red-500/10"
                                                }>
                                                    {invite.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(invite.expiresAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Active Trainers</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : activeTrainers.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-8 w-8 text-neutral-400 mx-auto mb-3 opacity-50" />
                            <p className="text-neutral-500">No active trainers found.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-neutral-50 dark:bg-neutral-900/50">
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Organization</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Sessions Built</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeTrainers.map((trainer) => (
                                        <TableRow key={trainer.id}>
                                            <TableCell>
                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">{trainer.name}</div>
                                                <div className="text-xs text-neutral-500">{trainer.email}</div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{trainer.organization || "—"}</TableCell>
                                            <TableCell>
                                                {trainer.status === "APPROVED" ? (
                                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>
                                                ) : (
                                                    <Badge className="bg-neutral-500/10 text-neutral-500 border-neutral-500/20">{trainer.status}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {trainer._count?.sessionsAsTrainer || 0}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
