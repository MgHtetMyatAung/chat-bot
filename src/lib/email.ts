import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "May Myan AI <onboarding@resend.dev>"; // Resend's default testing email

export const sendAuthEmail = {
    verification: async (email: string, url: string) => {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [email],
            subject: 'Verify your email address - May Myan AI',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">
                    <h1 style="color: #2563eb;">Welcome to May Myan AI!</h1>
                    <p>Please click the button below to verify your email address and start using your AI chatbots.</p>
                    <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">
                        Verify My Email
                    </a>
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">
                        If you didn't create an account, you can safely ignore this email.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
                    <p style="font-size: 12px; color: #999;">
                        &copy; ${new Date().getFullYear()} May Myan AI. All rights reserved.
                    </p>
                </div>
            `
        });

        if (error) {
            console.error('[RESEND ERROR]', error);
            throw new Error(`Failed to send verification email: ${error.message}`);
        }

        return data;
    },

    resetPassword: async (email: string, url: string) => {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [email],
            subject: 'Reset your password - May Myan AI',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">
                    <h1 style="color: #2563eb;">Password Reset Request</h1>
                    <p>We received a request to reset your password. Click the button below to proceed.</p>
                    <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">
                        Reset Password
                    </a>
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">
                        If you didn't request a password reset, you can safely ignore this email.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
                    <p style="font-size: 12px; color: #999;">
                        &copy; ${new Date().getFullYear()} May Myan AI. All rights reserved.
                    </p>
                </div>
            `
        });

        if (error) {
            console.error('[RESEND ERROR]', error);
            throw new Error(`Failed to send reset password email: ${error.message}`);
        }

        return data;
    }
};
