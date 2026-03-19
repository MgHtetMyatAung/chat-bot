import { Bot } from 'lucide-react';
import ChatbotTabs from '@/components/ChatbotTabs';

export default async function ChatbotDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b border-white/10 pb-6 group text-center sm:text-left">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/10 group-hover:scale-110 transition-transform duration-500 shrink-0">
          <Bot size={24} className="text-white drop-shadow-md sm:w-8 sm:h-8" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white/90">Chatbot Dashboard</h1>
          <p className="text-zinc-500 mt-1 font-medium tracking-wide flex flex-wrap items-center justify-center sm:justify-start gap-2">
            AI Assistant Configuration <span className="hidden sm:inline w-1 h-1 rounded-full bg-zinc-600" /> <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded opacity-50">ID: {id}</span>
          </p>
        </div>
      </div>

      <ChatbotTabs id={id} />

      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}
