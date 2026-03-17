import { Bot, FileText, MessageSquare, Code, Settings, Play } from 'lucide-react';
import Link from 'next/link';

export default async function ChatbotDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const tabs = [
    { name: 'Settings', href: `/dashboard/chatbots/${id}`, icon: Settings },
    { name: 'Knowledge Base', href: `/dashboard/chatbots/${id}/knowledge`, icon: FileText },
    { name: 'Conversations', href: `/dashboard/chatbots/${id}/conversations`, icon: MessageSquare },
    { name: 'Preview', href: `/dashboard/chatbots/${id}/preview`, icon: Play },
    { name: 'Widget', href: `/dashboard/chatbots/${id}/widget`, icon: Code },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Bot size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Chatbot Details</h1>
          <p className="text-zinc-400 mt-1">Configure your AI assistant</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-white/10">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 border-b-2 border-transparent hover:border-white/50 transition-all rounded-t-lg"
          >
            <tab.icon size={16} />
            {tab.name}
          </Link>
        ))}
      </div>

      <div className="pt-4">
        {children}
      </div>
    </div>
  );
}
