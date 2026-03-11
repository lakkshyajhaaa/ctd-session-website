import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "@prisma/client";

const ROLE_PATHS: Record<string, Role[]> = {
  "/dashboard/admin": [Role.ADMIN],
  "/admin": [Role.ADMIN],
  "/dashboard/trainer": [Role.TRAINER, Role.ADMIN],
  "/trainer": [Role.TRAINER, Role.ADMIN],
  "/dashboard/student": [Role.STUDENT, Role.ADMIN],
  "/student": [Role.STUDENT, Role.ADMIN],
};

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, userId: string, role: Role) => Promise<NextResponse>
) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id || !token?.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pathname = request.nextUrl.pathname;
  for (const [path, allowedRoles] of Object.entries(ROLE_PATHS)) {
    if (pathname.startsWith(path) && !allowedRoles.includes(token.role as Role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return handler(request, token.id as string, token.role as Role);
}

export function requireRole(roles: Role[]) {
  return async (request: NextRequest, userId: string, userRole: Role) => {
    if (!roles.includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
  };
}
