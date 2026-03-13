"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, BarChart3, Calendar } from "lucide-react";

export default function VerifyEmailPage() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const router = useRouter();
    const { data: session, update } = useSession();
    const { toast } = useToast();

    // If session recognizes email as verified natively, bump them out.
    if (session?.user?.emailVerified) {
        router.push("/dashboard");
        return null;
    }

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        if (code.length !== 6) {
            toast({ title: "Invalid Code", description: "Verification codes must be exactly 6 digits.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast({
                    title: "Verification Failed",
                    description: data.error || "The code you provided is invalid or has expired.",
                    variant: "destructive",
                });
                return;
            }

            // Force NextAuth session refresh locally updating standard typings pushing them directly into authorized areas
            await update({ emailVerified: data.emailVerified });

            toast({
                title: "Email Verified!",
                description: "Your CTD account is now fully active.",
                variant: "success",
            });

            router.push("/dashboard");
            router.refresh();
        } catch {
            toast({
                title: "Error",
                description: "Something went wrong communicating with the server.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        setResending(true);
        try {
            const res = await fetch("/api/auth/resend", { method: "POST" });

            if (!res.ok) {
                toast({ title: "Resend Failed", description: "Please wait a moment before requesting another code.", variant: "destructive" });
                return;
            }

            toast({
                title: "New Code Sent",
                description: "Please check your inbox (and spam folder) for the latest code.",
                variant: "success",
            });
        } catch {
            toast({ title: "Error", description: "Network error requesting new code.", variant: "destructive" });
        } finally {
            setResending(false);
        }
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: "body { margin: 0; }" }} />
            <main className="min-h-screen w-full flex items-center justify-center bg-neutral-950 relative px-6 md:px-10 py-8 lg:py-0">

                {/* Fixed Decorative Background Grid */}
                <div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
                        backgroundSize: "60px 60px"
                    }}
                />

                {/* Massive subtle background glow to anchor the container */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gradient-to-r from-purple-600/20 via-indigo-600/10 to-blue-600/20 blur-[220px] rounded-full pointer-events-none z-0"
                />

                {/* Centered Framing Container */}
                <div className="w-full max-w-[1400px] min-h-[85vh] lg:h-[85vh] rounded-[24px] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.6)] border border-neutral-800 bg-neutral-950 grid grid-cols-1 lg:grid-cols-2 relative z-10">

                    {/* External Thapar Logo Anchor positioned INSIDE the container */}
                    <Link
                        href="https://thapar.edu"
                        target="_blank"
                        className="absolute top-[24px] right-[24px] z-50 opacity-80 hover:opacity-100 transition hidden lg:block"
                    >
                        <Image
                            src="/logos/thapar.png"
                            alt="Thapar Institute Logo"
                            width={40}
                            height={40}
                            className="w-[40px] h-auto cursor-pointer object-contain"
                        />
                    </Link>

                    {/* Left Panel: Branding & Context */}
                    <div
                        className="relative w-full h-full flex flex-col justify-between p-12 lg:p-14 z-10"
                        style={{
                            background: "linear-gradient(160deg, #2d1b69, #4c1d95, #6d28d9)"
                        }}
                    >
                        {/* Subtle Radial Lighting */}
                        <div
                            className="absolute inset-0 z-0 pointer-events-none"
                            style={{
                                background: "radial-gradient(circle at 30% 40%, rgba(139,92,246,0.25), transparent)"
                            }}
                        />

                        {/* Top Section */}
                        <div className="relative z-10">
                            <Image
                                src="/logos/ctd.svg"
                                alt="Centre for Training & Development"
                                width={182}
                                height={36}
                                priority
                                className="h-auto"
                            />
                        </div>

                        {/* Middle Section */}
                        <div className="relative z-10 pl-[68px]">
                            <div className="space-y-2 relative mb-10">
                                {/* Subtle title glow */}
                                <div className="absolute -inset-4 bg-purple-500 blur-3xl opacity-20 -z-10 rounded-full border-none" />

                                <h1 className="text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-tight mt-2 pb-2">
                                    Session Attendance Portal
                                </h1>

                                <p className="text-[17px] text-neutral-300 leading-relaxed pt-2 max-w-[360px]">
                                    Manage CTD training sessions, attendance tracking, and student participation across programs.
                                </p>
                            </div>

                            <div className="flex flex-col gap-5">
                                <div className="flex items-center gap-4 text-neutral-200">
                                    <div className="w-[40px] h-[40px] rounded-[10px] bg-purple-500/10 flex flex-shrink-0 items-center justify-center border border-purple-500/20">
                                        <CheckCircle className="w-5 h-5 text-purple-300" />
                                    </div>
                                    <span className="font-medium text-[15px]">Record attendance for scheduled sessions</span>
                                </div>

                                <div className="flex items-center gap-4 text-neutral-200">
                                    <div className="w-[40px] h-[40px] rounded-[10px] bg-purple-500/10 flex flex-shrink-0 items-center justify-center border border-purple-500/20">
                                        <Calendar className="w-5 h-5 text-purple-300" />
                                    </div>
                                    <span className="font-medium text-[15px]">Manage CTD training schedules</span>
                                </div>

                                <div className="flex items-center gap-4 text-neutral-200">
                                    <div className="w-[40px] h-[40px] rounded-[10px] bg-purple-500/10 flex flex-shrink-0 items-center justify-center border border-purple-500/20">
                                        <BarChart3 className="w-5 h-5 text-purple-300" />
                                    </div>
                                    <span className="font-medium text-[15px]">Monitor student participation</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="relative z-10 pl-[68px]">
                            <p className="text-sm text-neutral-400 font-medium">
                                &copy; Centre for Training & Development<br />
                                Thapar Institute of Engineering & Technology
                            </p>
                        </div>
                    </div>

                    {/* Subtle Vertical Divider connecting panels */}
                    <div className="hidden lg:block absolute top-[10%] bottom-[10%] left-1/2 w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent z-20" />

                    {/* Right Panel: Verification Form */}
                    <div className="relative flex items-center justify-center w-full z-10 p-4 lg:p-8">

                        {/* Verification Card Container */}
                        <div className="w-full max-w-md bg-[#0f0f0f] border border-neutral-800/60 rounded-[16px] shadow-xl p-6 relative z-10">

                            <div className="space-y-3 mb-10 text-center">
                                <h2 className="text-3xl font-bold text-white tracking-tight">Verify your email</h2>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    We&apos;ve sent a 6-digit confirmation code to <span className="text-white font-medium">{session?.user?.email}</span>.
                                </p>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="text-sm font-medium text-neutral-300">Confirmation Code</Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        maxLength={6}
                                        placeholder="123456"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                                        required
                                        className="rounded-lg bg-neutral-800/70 border-neutral-700 text-center text-white text-2xl tracking-[0.5em] placeholder:text-neutral-600 focus:border-purple-500 focus:ring-purple-500 h-14"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading || code.length !== 6}
                                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium rounded-lg h-12 border-0 transition"
                                >
                                    {loading ? "Verifying..." : "Verify Account"}
                                </Button>
                            </form>

                            <div className="mt-8 space-y-4">
                                <p className="text-center text-sm text-neutral-400">
                                    Didn&apos;t receive the email?{" "}
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resending}
                                        className="text-purple-400 hover:text-purple-300 hover:underline transition-colors focus:outline-none disabled:opacity-50 disabled:no-underline"
                                    >
                                        {resending ? "Sending..." : "Click to resend"}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </>
    );
}
