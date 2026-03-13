"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle,
  FileText,
  Trophy,
  Clock,
  Settings,
  LogOut,
  Users,
  BarChart,
  LineChart,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

const studentNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/sessions", label: "My Sessions", icon: BookOpen },
  { href: "/dashboard/attendance", label: "Attendance", icon: CheckCircle },
  { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
  { href: "/dashboard/progress", label: "Progress", icon: BarChart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const trainerNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/sessions", label: "Sessions", icon: BookOpen },
  { href: "/dashboard/attendance", label: "Attendance Management", icon: CheckCircle },
  { href: "/dashboard/students", label: "Student List", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: Clock },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const adminNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/trainers", label: "Trainers", icon: Users },
  { href: "/dashboard/admin/sessions", label: "Sessions", icon: BookOpen },
  { href: "/dashboard/admin/analytics", label: "Analytics", icon: LineChart },
  { href: "/dashboard/reports", label: "Reports", icon: Clock },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  let activeNavItems = studentNavItems;
  if (role === Role.TRAINER) activeNavItems = trainerNavItems;
  if (role === Role.ADMIN) activeNavItems = adminNavItems;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 px-4 py-4">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logos/ctd.svg"
              alt="CTD Logo"
              width={140}
              height={36}
              style={{ height: "36px", objectFit: "contain" }}
              priority
            />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {activeNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            let iconColor = "text-purple-500 dark:text-purple-400";
            if (["Sessions", "My Sessions", "Attendance", "Attendance Management"].includes(item.label)) {
              iconColor = "text-orange-500 dark:text-orange-400";
            }
            if (["Achievements", "Reports", "Analytics", "Users"].includes(item.label)) {
              iconColor = "text-green-500 dark:text-green-400";
            }
            if (isActive) iconColor = "text-purple-700 dark:text-purple-300";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 hover:shadow-md"
                    : "text-muted-foreground hover:bg-purple-50 hover:text-purple-900 dark:hover:bg-neutral-900 dark:hover:text-purple-300"
                )}
              >
                <item.icon className={cn("h-5 w-5", iconColor)} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4 space-y-2">
          <Link
            href="/dashboard/team"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-300"
          >
            <Code className="h-5 w-5" />
            Our Development Team
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
