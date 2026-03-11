import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { RegisterInput } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/mail";

export async function createUser(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  // Generate 6-digit confirmation code
  const token = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour lifetime

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: (data.role as Role) || Role.STUDENT,
      rollNumber: data.role === "STUDENT" ? data.rollNumber?.toUpperCase() : null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // Provision validation gate securely ignoring returned exceptions if mailer configurations are inactive
  try {
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        type: "VERIFY_EMAIL",
        expiresAt,
      }
    });

    await sendVerificationEmail(user.email, token);
  } catch (err) {
    console.error("Failed to generate/dispatch validation token:", err);
  }

  return user;
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}
