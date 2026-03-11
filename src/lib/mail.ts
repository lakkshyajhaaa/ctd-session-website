import nodemailer from "nodemailer";

// Using a localized NodeMailer configuration mocking dispatch logic in development terminals.
// To switch to a real email delivery platform, inject standard SMTP parameters into the createTransport string here.
const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1025, // Mock port
    secure: false, // Disabling TLS for local mocks
});

// Since we are operating locally, we'll override the dispatch flow entirely to simply log to terminal to prevent crashes.
export async function sendVerificationEmail(email: string, code: string) {
    if (process.env.NODE_ENV === "development") {
        console.log(`\n\n`);
        console.log(`========================= EMAIL DISPATCH =========================`);
        console.log(`To: ${email}`);
        console.log(`Subject: Verify your CTD Portal Email Address`);
        console.log(`Body: Your verification code is: => ${code} <= `);
        console.log(`==================================================================`);
        console.log(`\n\n`);
        return true;
    }

    try {
        await transporter.sendMail({
            from: '"CTD Portal" <no-reply@ctd.thapar.edu>',
            to: email,
            subject: "Verify your CTD Portal Email Address",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px;">
                    <h2 style="color: #6d28d9;">CTD Account Verification</h2>
                    <p>Welcome to the Centre for Training & Development Portal!</p>
                    <p>Enter the following 6-digit code to complete your registration process:</p>
                    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111;">${code}</span>
                    </div>
                    <p>If you did not request this email, please ignore it.</p>
                </div>
            `,
        });
        return true;
    } catch (err) {
        console.error("Mail Dispatch Failure [Verify]:", err);
        return false;
    }
}

export async function sendPasswordResetEmail(email: string, code: string) {
    if (process.env.NODE_ENV === "development") {
        console.log(`\n\n`);
        console.log(`========================= EMAIL DISPATCH =========================`);
        console.log(`To: ${email}`);
        console.log(`Subject: Reset your CTD Portal Password`);
        console.log(`Body: Your password reset code is: => ${code} <= `);
        console.log(`==================================================================`);
        console.log(`\n\n`);
        return true;
    }

    try {
        await transporter.sendMail({
            from: '"CTD Portal" <no-reply@ctd.thapar.edu>',
            to: email,
            subject: "Reset your CTD Portal Password",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px;">
                    <h2 style="color: #6d28d9;">CTD Password Reset</h2>
                    <p>We received a request to securely reset your password.</p>
                    <p>Enter the following 6-digit code on the reset page to choose your new password. This code will expire in exactly 1 hour.</p>
                    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111;">${code}</span>
                    </div>
                    <p>If you did not request this reset, simply ignore this email and your password will remain untouched.</p>
                </div>
            `,
        });
        return true;
    } catch (err) {
        console.error("Mail Dispatch Failure [Reset]:", err);
        return false;
    }
}
