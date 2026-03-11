import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/?callbackUrl=/admin");
  }

  if (session.user?.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
