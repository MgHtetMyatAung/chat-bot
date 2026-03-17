import { Bot, MessageSquare, Database, Activity, ArrowUpRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';

export default async function DashboardOverview() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) return null;

  const [chatbotCount, convoCount, knowledgeCount] = await Promise.all([
    prisma.chatbot.count({ where: { userId: session.user.id } }),
    prisma.conversation.count({ where: { chatbot: { userId: session.user.id } } }),
    prisma.knowledgeBase.count({ where: { chatbot: { userId: session.user.id } } }),
  ]);

  const stats = [
    { label: 'Total Chatbots', value: chatbotCount, icon: Bot, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Conversations', value: convoCount, icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Knowledge Base Items', value: knowledgeCount, icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'System Status', value: 'Live', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
          <p className="text-zinc-400 mt-2">Welcome back, {session.user.name}. Here's the pulse of your AI fleet.</p>
        </div>
        <Link 
          href="/dashboard/chatbots" 
          className="flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          View all chatbots
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-all cursor-default relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/10 transition-all" />
            <div className="flex items-center justify-between relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass border border-white/5 rounded-2xl p-8 bg-blue-500/5">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/dashboard/chatbots" className="p-4 rounded-xl bg-zinc-900 border border-white/5 hover:border-white/20 transition-all space-y-2 group">
               <Bot className="text-blue-500 group-hover:scale-110 transition-transform" />
               <p className="text-white font-bold">New Chatbot</p>
               <p className="text-xs text-zinc-500 leading-relaxed">Create a new AI assistant and configure it for your website.</p>
            </Link>
             <Link href="/dashboard/chatbots" className="p-4 rounded-xl bg-zinc-900 border border-white/5 hover:border-white/20 transition-all space-y-2 group">
                <Database className="text-emerald-500 group-hover:scale-110 transition-transform" />
                <p className="text-white font-bold">Add Knowledge</p>
                <p className="text-xs text-zinc-500 leading-relaxed">Boost your chatbot's intelligence by adding custom text resources.</p>
             </Link>
          </div>
        </div>

        <div className="glass border border-white/5 rounded-2xl p-8 bg-zinc-900/50">
          <h2 className="text-xl font-bold text-white mb-4">System Health</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Memory Usage</span>
              <span className="text-xs font-mono text-zinc-600">64%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-500 h-full w-[64%] shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">API Response Time</span>
              <span className="text-xs font-mono text-zinc-600">124ms</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[20%] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
