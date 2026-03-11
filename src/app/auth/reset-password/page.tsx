import { redirect } from "next/navigation";

export default function ResetPasswordRedirect() {
    // We've moved the reset-password flow into the forgot-password UI natively.
    redirect("/auth/forgot-password");
}
