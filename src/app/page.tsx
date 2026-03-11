"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, BarChart3, Calendar } from "lucide-react";

export default function HomePage() {
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState<"STUDENT" | "TRAINER">("STUDENT");
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
        variant: "success",
      });
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, rollNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        let errorMessage = "Please try again";
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
        title: "Account created",
        description: "Please sign in with your credentials.",
        variant: "success",
      });
      setAuthMode("signin");
      setPassword(""); // Clear password for a clean sign-in experience
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: "body { margin: 0; }" }} />
      <main className="min-h-screen min-[900px]:h-screen w-full flex items-center justify-center bg-neutral-950 relative overflow-x-hidden min-[900px]:overflow-hidden p-4 min-[900px]:p-0">

        {/* Fixed Decorative Background Grid */}
        <div
          className="absolute inset-0 pointer-events-none z-50 mix-blend-screen opacity-100"
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
        <div className="w-full max-w-[1200px] min-[900px]:h-full min-[900px]:max-h-[95vh] rounded-[20px] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.6)] border border-neutral-800 bg-neutral-950 flex flex-col min-[900px]:flex-row relative z-10">

          {/* External Thapar Logo Anchor positioned INSIDE the container */}
          <Link
            href="https://thapar.edu"
            target="_blank"
            className="absolute top-[24px] right-[24px] z-50 opacity-80 hover:opacity-100 transition hidden min-[900px]:block"
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
            className="relative w-full min-[900px]:w-1/2 min-h-[400px] min-[900px]:h-full flex flex-col justify-center px-8 py-12 min-[900px]:px-[64px] min-[900px]:py-[72px] z-10"
            style={{
              background: "linear-gradient(160deg, #2d1b69, #4c1d95, #6d28d9)",
              boxShadow: "inset -40px 0 80px rgba(0,0,0,0.2)"
            }}
          >
            {/* Subtle Radial Lighting */}
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 30% 40%, rgba(139,92,246,0.25), transparent)"
              }}
            />

            {/* Combined Content Container */}
            <div className="relative z-10 flex flex-col w-full max-w-[460px]">

              {/* Logo Section */}
              <div className="mb-12">
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
              <div className="space-y-2 relative mb-12 text-left">
                {/* Subtle title glow */}
                <div className="absolute -inset-4 bg-purple-500 blur-3xl opacity-20 -z-10 rounded-full border-none" />

                <h1 className="text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-tight pb-2">
                  Session Attendance Portal
                </h1>

                <p className="text-[17px] text-neutral-300 leading-relaxed pt-2 max-w-[420px]">
                  Manage CTD training sessions, attendance tracking, and student participation across programs.
                </p>
              </div>

              {/* Feature List */}
              <div className="flex flex-col gap-6 mb-16">
                <div className="flex items-center gap-[16px] text-neutral-200">
                  <div className="w-[40px] h-[40px] rounded-[10px] bg-purple-500/10 flex flex-shrink-0 items-center justify-center border border-purple-500/20">
                    <CheckCircle className="w-5 h-5 text-purple-300" />
                  </div>
                  <span className="font-medium text-[15px] leading-tight m-0">Record attendance for scheduled sessions</span>
                </div>

                <div className="flex items-center gap-[16px] text-neutral-200">
                  <div className="w-[40px] h-[40px] rounded-[10px] bg-purple-500/10 flex flex-shrink-0 items-center justify-center border border-purple-500/20">
                    <Calendar className="w-5 h-5 text-purple-300" />
                  </div>
                  <span className="font-medium text-[15px] leading-tight m-0">Manage CTD training schedules</span>
                </div>

                <div className="flex items-center gap-[16px] text-neutral-200">
                  <div className="w-[40px] h-[40px] rounded-[10px] bg-purple-500/10 flex flex-shrink-0 items-center justify-center border border-purple-500/20">
                    <BarChart3 className="w-5 h-5 text-purple-300" />
                  </div>
                  <span className="font-medium text-[15px] leading-tight m-0">Monitor student participation</span>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="mt-auto">
                <p className="text-sm text-neutral-400 font-medium">
                  &copy; Centre for Training & Development<br />
                  Thapar Institute of Engineering & Technology
                </p>
              </div>
            </div>
          </div>

          {/* Subtle Vertical Divider connecting panels */}
          <div className="hidden min-[900px]:block absolute top-[10%] bottom-[10%] left-1/2 w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent z-20" />

          {/* Right Panel: Authentication Form */}
          <div className="relative w-full min-[900px]:w-1/2 py-10 min-[900px]:py-0 min-[900px]:h-full flex flex-col justify-center items-center z-10 p-4 lg:p-8 min-[900px]:overflow-y-auto">

            {/* Login Card Container */}
            <div className="w-full max-w-[500px] bg-[#0f0f0f] border border-neutral-800/60 rounded-[16px] shadow-xl p-8 min-[900px]:p-[48px] relative z-10 flex flex-col justify-center">

              {authMode === "signin" ? (
                <>
                  <div className="space-y-3 mb-10 text-center">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Sign in to your CTD account</h2>
                    <p className="text-neutral-400 text-sm leading-relaxed">Use your registered email to access the training portal.</p>
                  </div>

                  <form onSubmit={handleSignIn} className="flex flex-col gap-[20px]">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm font-medium text-neutral-300">Email</Label>
                      <div className="relative flex items-center">
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full rounded-lg bg-neutral-800/70 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-purple-500 focus:ring-purple-500 h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-sm font-medium text-neutral-300">Password</Label>
                      <div className="relative flex items-center">
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full rounded-lg bg-neutral-800/70 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-purple-500 focus:ring-purple-500 h-11"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      style={{
                        background: "linear-gradient(90deg, #8b5cf6, #6366f1)"
                      }}
                      className="w-full text-white font-medium rounded-lg h-12 border-0 transition-transform duration-200 hover:-translate-y-[1px] hover:shadow-[0_6px_16px_rgba(139,92,246,0.35)] mt-[28px]"
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>

                  <div className="mt-[24px] flex flex-col items-center gap-3">
                    <p className="text-center text-sm text-neutral-400">
                      Don't have an account?{" "}
                      <button
                        onClick={() => setAuthMode("register")}
                        className="text-purple-400 hover:text-purple-300 transition-colors focus:outline-none font-semibold"
                      >
                        Register
                      </button>
                    </p>
                    <p className="text-center text-sm">
                      <Link href="/auth/forgot-password" style={{ color: "#9ca3af" }} className="hover:text-neutral-300 transition-colors focus:outline-none text-sm">
                        Forgot password?
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3 mb-4 text-center">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Create your CTD account</h2>
                    <p className="text-neutral-400 text-sm leading-relaxed">Enter your details to register.</p>
                  </div>

                  <form onSubmit={handleRegister} className="flex flex-col gap-[20px]">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="text-sm font-medium text-neutral-300">Name</Label>
                      <div className="relative flex items-center">
                        <Input
                          id="reg-name"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full rounded-lg bg-neutral-800/70 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-purple-500 focus:ring-purple-500 h-[42px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-sm font-medium text-neutral-300">Email</Label>
                      <div className="relative flex items-center">
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full rounded-lg bg-neutral-800/70 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-purple-500 focus:ring-purple-500 h-[42px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-sm font-medium text-neutral-300">Password</Label>
                      <div className="relative flex items-center">
                        <Input
                          id="reg-password"
                          type="password"
                          placeholder="Min 8 chars, 1 upper"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full rounded-lg bg-neutral-800/70 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-purple-500 focus:ring-purple-500 h-[42px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pb-2">
                      <Label htmlFor="reg-roll" className="text-sm font-medium text-neutral-300">Roll Number</Label>
                      <div className="relative flex items-center">
                        <Input
                          id="reg-roll"
                          type="text"
                          placeholder="e.g. 102213031"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          required
                          className="w-full rounded-lg bg-neutral-800/70 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-purple-500 focus:ring-purple-500 h-[42px]"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      style={{
                        background: "linear-gradient(90deg, #8b5cf6, #6366f1)"
                      }}
                      className="w-full text-white font-medium rounded-lg h-12 border-0 transition-transform duration-200 hover:-translate-y-[1px] hover:shadow-[0_6px_16px_rgba(139,92,246,0.35)] mt-[28px]"
                    >
                      {loading ? "Registering..." : "Register"}
                    </Button>
                  </form>

                  <div className="mt-[24px] flex flex-col items-center">
                    <p className="text-center text-sm text-neutral-400">
                      Already have an account?{" "}
                      <button
                        onClick={() => setAuthMode("signin")}
                        className="text-purple-400 hover:text-purple-300 transition-colors focus:outline-none font-semibold"
                      >
                        Sign In
                      </button>
                    </p>
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
