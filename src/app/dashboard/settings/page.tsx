"use client";

import { useState, useEffect } from "react";
import { Lock, Loader2, ShieldCheck, KeyRound, User, Mail, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const { data: session } = authClient.useSession();
    const [name, setName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
    }, [session]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            const { error } = await authClient.updateUser({
                name: name,
            });

            if (error) {
                toast.error(error.message || "Failed to update profile");
            } else {
                toast.success("Profile updated successfully!");
            }
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const { error } = await authClient.changePassword({
                newPassword: newPassword,
                currentPassword: currentPassword,
                revokeOtherSessions: true,
            });

            if (error) {
                toast.error(error.message || "Failed to update password");
            } else {
                toast.success("Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            toast.error("Failed to update password");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
                <p className="text-zinc-400">Manage your profile information and security preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Section Info */}
                <div className="col-span-1 space-y-4">
                    <div className="p-6 glass-card rounded-3xl border border-white/10 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <User className="text-blue-400" size={24} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-white font-bold">Profile Details</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                Your personal information is used to personalize your experience across Nexus AI.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="col-span-2">
                    <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
                            <User size={20} className="text-zinc-400" />
                            <h2 className="text-xl font-bold text-white">General Information</h2>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Display Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User size={18} className="text-zinc-500" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail size={18} className="text-zinc-500" />
                                        </div>
                                        <input
                                            type="email"
                                            readOnly
                                            value={session?.user?.email || ""}
                                            className="w-full pl-11 pr-4 py-3 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl text-zinc-500 cursor-not-allowed italic"
                                        />
                                        {session?.user?.emailVerified && (
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                <CheckCircle2 size={16} className="text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-zinc-600 px-1">Email cannot be changed currently.</p>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isUpdatingProfile || name === session?.user?.name}
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
                                >
                                    {isUpdatingProfile ? <Loader2 size={18} className="animate-spin" /> : "Update Profile"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/5 pt-10" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Security Section Info */}
                <div className="col-span-1 space-y-4">
                    <div className="p-6 glass-card rounded-3xl border border-white/10 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                            <ShieldCheck className="text-purple-400" size={24} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-white font-bold">Security & Privacy</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                Manage your password and active sessions to keep your account secure.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Password Form */}
                <div className="col-span-2">
                    <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
                            <KeyRound size={20} className="text-zinc-400" />
                            <h2 className="text-xl font-bold text-white">Update Password</h2>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Current Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-zinc-500" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">New Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-zinc-500" />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Confirm New Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-zinc-500" />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isUpdatingPassword}
                                    className="px-8 py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
                                >
                                    {isUpdatingPassword ? <Loader2 size={18} className="animate-spin" /> : "Save New Password"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-6 p-6 rounded-3xl border border-yellow-500/20 bg-yellow-500/5">
                        <p className="text-sm text-yellow-500/80 font-medium">
                            Note: Updating your password will sign you out of all other active sessions for your security.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
