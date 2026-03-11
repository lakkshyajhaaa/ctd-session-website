import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    emailVerified?: Date | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      emailVerified?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    emailVerified?: string | null;
  }
}
