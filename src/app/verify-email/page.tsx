"use client";

import { useState, useEffect } from "react";
import { Mail, Loader2, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
    const { data: session } = authClient.useSession();
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResend = async () => {
        if (countdown > 0 || isResending) return;
        setIsResending(true);
        try {
            await authClient.sendVerificationEmail({
                email: session?.user?.email || "",
                callbackURL: window.location.origin + "/dashboard",
            });
            toast.success("Verification email sent!");
            setCountdown(60);
        } catch (error) {
            toast.error("Failed to resend verification email");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md p-8 relative z-10 text-center">
                <div className="glass-card rounded-3xl p-10 border border-white/10 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <Mail size={40} className="text-blue-400 animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Verify your email</h1>
                        <p className="text-zinc-400">
                            We've sent a verification link to <span className="text-white font-medium">{session?.user?.email}</span>. Please click the link to confirm your account.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-4">
                        <button
                            onClick={handleResend}
                            disabled={isResending || countdown > 0}
                            className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                        >
                            {isResending ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <RefreshCw size={18} className={`group-hover:rotate-180 transition-transform duration-500 ${countdown > 0 ? 'opacity-50' : ''}`} />
                            )}
                            {countdown > 0 ? `Resend in ${countdown}s` : "Resend Email"}
                        </button>

                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>

                    <div className="bg-zinc-900/50 rounded-2xl p-4 flex items-start gap-3 text-left border border-white/5">
                        <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Once verified, you'll gain full access to the May Myan AI Dashboard and your chatbots.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
