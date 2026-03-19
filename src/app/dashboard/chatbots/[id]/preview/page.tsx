"use client";

import { use, useState, useEffect } from 'react';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import ChatPreview from '@/components/ChatPreview';

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const [chatbot, setChatbot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChatbot() {
      try {
        const res = await fetch(`/api/chatbots/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const found = await res.json();
        setChatbot(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchChatbot();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={32} className="animate-spin text-zinc-500" />
    </div>
  );

  if (!chatbot) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-b from-white/5 to-transparent">
        <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center border border-white/10 shadow-2xl">
          <Bot size={40} className="text-blue-500" />
        </div>
        
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            Live Test Bench
            <Sparkles size={20} className="text-amber-400" />
          </h2>
          <p className="text-zinc-400 text-sm">
            Test your chatbot's responses. The widget in the bottom right corner is exactly how it will appear on your target website.
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-bold uppercase tracking-widest">
            Knowledge Integrated
          </div>
          <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-xs font-bold uppercase tracking-widest">
            {chatbot.modelId.split('/').pop()}
          </div>
        </div>
      </div>

      <ChatPreview chatbot={chatbot} />
    </div>
  );
}
