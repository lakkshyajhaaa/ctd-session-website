import { prisma } from "@/lib/prisma";
import TrainerRegisterForm from "./form";
import Link from "next/link";
import { XCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";

// Bypass static TS errors for dynamic lookup
export const dynamic = "force-dynamic";

export default async function InviteTrainerPage({ searchParams }: { searchParams: { token?: string } }) {
    const token = searchParams.token;

    const PageWrapper = ({ children }: { children: React.ReactNode }) => (
        <main className="min-h-screen w-full flex items-center justify-center bg-neutral-950 relative px-6 md:px-10">
            <div className="absolute inset-0 pointer-events-none z-0" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                backgroundSize: "60px 60px"
            }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gradient-to-r from-purple-600/20 via-indigo-600/10 to-blue-600/20 blur-[220px] rounded-full pointer-events-none z-0" />

            <div className="w-full max-w-md bg-[#0f0f0f] border border-neutral-800/60 rounded-[16px] shadow-xl p-8 relative z-10">
                <div className="flex justify-center mb-8">
                    <Image src="/logos/ctd.svg" alt="CTD Logo" width={140} height={32} />
                </div>
                {children}
            </div>
        </main>
    );

    if (!token) {
        return (
            <PageWrapper>
                <div className="text-center space-y-4">
                    <XCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h2 className="text-xl font-bold text-white">Invalid Link</h2>
                    <p className="text-sm text-neutral-400">This invitation link is missing a secure token.</p>
                    <div className="pt-4">
                        <Link href="/" className="text-purple-400 hover:text-purple-300">Return to Portal</Link>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    const invite = await prisma.trainerInvite.findUnique({ where: { token } });

    if (!invite) {
        return (
            <PageWrapper>
                <div className="text-center space-y-4">
                    <XCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h2 className="text-xl font-bold text-white">Invalid Invitation</h2>
                    <p className="text-sm text-neutral-400">The token provided does not match any existing invitations.</p>
                    <div className="pt-4">
                        <Link href="/" className="text-purple-400 hover:text-purple-300">Return to Portal</Link>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    if (invite.status === "ACCEPTED") {
        return (
            <PageWrapper>
                <div className="text-center space-y-4">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                    <h2 className="text-xl font-bold text-white">Already Registered</h2>
                    <p className="text-sm text-neutral-400">This invitation has already been claimed. Your trainer account is active.</p>
                    <div className="pt-4">
                        <Link href="/" className="text-purple-400 hover:text-purple-300">Go to Sign In</Link>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    if (invite.expiresAt < new Date()) {
        return (
            <PageWrapper>
                <div className="text-center space-y-4">
                    <XCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h2 className="text-xl font-bold text-white">Invitation Expired</h2>
                    <p className="text-sm text-neutral-400">This invite link has expired. Please contact a CTD Admin for a new one.</p>
                    <div className="pt-4">
                        <Link href="/" className="text-purple-400 hover:text-purple-300">Return to Portal</Link>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="space-y-3 mb-8 text-center">
                <h2 className="text-2xl font-bold text-white tracking-tight">Complete Registration</h2>
                <p className="text-neutral-400 text-sm leading-relaxed">
                    You've been invited to join CTD as a Trainer.
                </p>
            </div>
            <TrainerRegisterForm email={invite.email} token={token} organization={invite.organization} />
        </PageWrapper>
    );
}
