"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface TrainerRegisterFormProps {
    email: string;
    token: string;
    organization: string | null;
}

export default function TrainerRegisterForm({ email, token, organization }: TrainerRegisterFormProps) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/trainer-register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, password, token }),
            });

            const data = await res.json();

            if (!res.ok) {
                let errorMessage = "Registration failed";
                if (typeof data.error === "string") {
                    errorMessage = data.error;
                } else if (typeof data.error === "object" && data.error !== null) {
                    const firstErrorKey = Object.keys(data.error)[0];
                    if (firstErrorKey && Array.isArray(data.error[firstErrorKey])) {
                        errorMessage = data.error[firstErrorKey][0];
                    }
                }

                toast({
                    title: "Registration failed",
                    description: errorMessage,
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Account Created!",
                description: "Your trainer account is active. Please log in.",
                variant: "success",
            });

            router.push("/");
            router.refresh();

        } catch (err) {
            toast({
                title: "Error",
                description: "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-neutral-300">Email (Locked)</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    disabled
                    className="rounded-lg bg-neutral-900 border-neutral-800 text-neutral-500 h-[42px] cursor-not-allowed opacity-70"
                />
            </div>

            {organization && (
                <div className="space-y-2">
                    <Label htmlFor="org" className="text-sm font-medium text-neutral-300">Organization (Locked)</Label>
                    <Input
                        id="org"
                        type="text"
                        value={organization}
                        readOnly
                        disabled
                        className="rounded-lg bg-neutral-900 border-neutral-800 text-neutral-500 h-[42px] cursor-not-allowed opacity-70"
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-neutral-300">Full Name</Label>
                <Input
                    id="name"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-lg bg-neutral-800/70 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-purple-500 focus:ring-purple-500 h-[42px]"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-neutral-300">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Min 8 chars, 1 upper"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-lg bg-neutral-800/70 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-purple-500 focus:ring-purple-500 h-[42px]"
                />
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium rounded-lg h-12 border-0 transition mt-4"
            >
                {loading ? "Creating Account..." : "Create Trainer Account"}
            </Button>
        </form>
    );
}
