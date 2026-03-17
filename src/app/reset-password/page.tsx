"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const token = searchParams.get("token");

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <ShieldCheck className="text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white">Invalid or Missing Token</h1>
                <p className="text-zinc-400">The password reset link is invalid or has expired.</p>
                <Link href="/login" className="inline-block mt-4 text-blue-400 hover:underline">
                    Back to login
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await authClient.resetPassword({
                newPassword: password,
                token: token,
            });

            if (error) {
                toast.error(error.message || "Failed to reset password");
            } else {
                toast.success("Password reset successful!");
                router.push("/login");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-700">
            <div className="space-y-2 text-center mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Set new password</h1>
                <p className="text-zinc-400 text-sm">Please choose a strong password you haven't used before.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">New Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-zinc-500" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Confirm Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-zinc-500" />
                        </div>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Reset Password"}
            </button>

            <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium mt-4"
            >
                <ArrowLeft size={16} />
                Back to Login
            </Link>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
                    <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
