import { redirect } from "next/navigation";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar />
      <main className="pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b bg-background/80 px-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">
              {session.user?.name}
            </span>
            <ThemeToggle />
            <Image
              src="/logos/thapar.png"
              alt="Thapar Logo"
              width={80}
              height={28}
              style={{ height: "28px", objectFit: "contain", marginLeft: "-24px" }}
              priority
            />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
