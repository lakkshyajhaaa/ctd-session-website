"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { KeyRound, ArrowRight, ArrowLeft, Mail, Lock, ShieldCheck, Asterisk } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // State 1: "email" | State 2: "reset" | State 3: "success"
  const [step, setStep] = useState<"email" | "reset" | "success">("email");

  // Reset State variables
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { toast } = useToast();
  const router = useRouter();

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Request Failed",
          description: data.error || "Cannot process reset request at this time.",
          variant: "destructive",
        });
        return;
      }

      setStep("reset");
      toast({
        title: "Code Sent",
        description: "Please check your inbox for the 6-digit confirmation code.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Network Error",
        description: "Something went wrong sending the reset instruction.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code || !password || !confirmPassword) return;

    if (code.length !== 6) {
      toast({ title: "Invalid Code", description: "Verification codes must be exactly 6 digits.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Passwords Do Not Match", description: "Please ensure both password fields are identical.", variant: "destructive" });
      return;
    }

    if (password.length < 8) {
      toast({ title: "Password Too Short", description: "Your new password must be at least 8 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Reset Failed",
          description: data.error || "The reset code has expired or is invalid.",
          variant: "destructive",
        });
        return;
      }

      setStep("success");
      toast({
        title: "Security Updated",
        description: "Your password has been successfully reset. You can now log in.",
        variant: "success",
      });

      setTimeout(() => {
        router.push("/");
      }, 3000);

    } catch {
      toast({
        title: "Network Error",
        description: "Failed to communicate with the security server. Try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
              <div className="space-y-4 relative mb-10">
                {/* Subtle title glow */}
                <div className="absolute -inset-4 bg-purple-500 blur-3xl opacity-20 -z-10 rounded-full border-none" />

                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 mb-6 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
                  <KeyRound className="w-6 h-6 text-white relative z-10" />
                </div>

                <h1 className="text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-tight mt-2 pb-2">
                  Account Recovery
                </h1>

                <p className="text-[17px] text-neutral-300 leading-relaxed pt-2 max-w-[360px]">
                  Securely regain access to your CTD Profile via secure verification layers mapped intrinsically to your identity parameters.
                </p>
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

          {/* Right Panel: Conditional Form Flow */}
          <div className="relative flex items-center justify-center w-full z-10 p-4 lg:p-8">

            {/* Card Container */}
            <div className="w-full max-w-md bg-[#0f0f0f] border border-neutral-800/60 rounded-[16px] shadow-xl p-6 relative z-10">

              {step === "success" && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                    <Lock className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Access Restored</h2>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                    Your password has been securely updated. You are being redirected to the login portal.
                  </p>
                  <Button
                    onClick={() => router.push("/")}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-white border-none mt-4 h-11"
                  >
                    Return to Login Now
                  </Button>
                </div>
              )}

              {step === "email" && (
                <>
                  <div className="space-y-3 mb-10 text-center">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Forgot Password?</h2>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                      Enter your email address and we'll send you a 6-digit confirmation code to reset your password securely.
                    </p>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-neutral-300">Email Address</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="student@thapar.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 rounded-lg bg-neutral-800/70 border-neutral-700 text-white placeholder:text-neutral-600 focus:border-purple-500 focus:ring-purple-500 h-11"
                        />
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || !email}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium rounded-lg h-11 border-0 transition"
                    >
                      {loading ? "Processing Request..." : "Send Reset Code"}
                    </Button>
                  </form>

                  <div className="mt-8 text-center">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Back to login
                    </Link>
                  </div>
                </>
              )}

              {step === "reset" && (
                <>
                  <div className="space-y-3 mb-8">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Enter Secure Code</h2>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                      We've dispatched a 6-digit security code to <span className="text-white font-medium">{email}</span>.
                      Please enter it below along with your new password.
                    </p>
                  </div>

                  <form onSubmit={handleResetSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-sm font-medium text-neutral-300">Confirmation Code</Label>
                      <Input
                        id="code"
                        type="text"
                        maxLength={6}
                        required
                        placeholder="123456"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                        className="rounded-lg bg-neutral-800/70 border-neutral-700 text-center text-white tracking-[0.3em] font-medium text-xl placeholder:text-neutral-600 focus:border-purple-500 focus:ring-purple-500 h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-neutral-300">New Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 rounded-lg bg-neutral-800/70 border-neutral-700 text-white placeholder:text-neutral-600 focus:border-purple-500 focus:ring-purple-500 h-11"
                        />
                        <Asterisk className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
                      </div>
                    </div>

                    <div className="space-y-2 pb-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-300">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type="password"
                          required
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 rounded-lg bg-neutral-800/70 border-neutral-700 text-white placeholder:text-neutral-600 focus:border-purple-500 focus:ring-purple-500 h-11"
                        />
                        <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || code.length !== 6 || !password || !confirmPassword}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium rounded-lg h-11 border-0 transition flex items-center justify-center gap-2"
                    >
                      {loading ? "Securing Account..." : (
                        <>
                          Reset Password <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-8 text-center flex justify-between items-center text-sm">
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="text-neutral-400 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      Change Email
                    </button>
                    <Link href="/" className="text-purple-400 hover:text-purple-300 hover:underline transition-colors focus:outline-none">
                      Cancel to Login
                    </Link>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>
      </main>
    </>
  );
}
