import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { TrainerDashboard } from "@/components/dashboard/trainer-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role === Role.ADMIN) {
    return <AdminDashboard />;
  }

  if (session.user.role === Role.TRAINER) {
    return <TrainerDashboard />;
  }

  return <StudentDashboard />;
}
