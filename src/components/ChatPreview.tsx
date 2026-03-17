"use client";

import { Bot, Send, User, X, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatPreview({ chatbot }: { chatbot: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ id: string, role: string, content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          apiKey: chatbot.apiKey,
          conversationId,
          visitorId: 'admin-preview',
        })
      });

      if (!response.ok) throw new Error('API Error');

      // Capture the conversationId from the first response
      const newConvId = response.headers.get('X-Conversation-Id');
      if (newConvId && !conversationId) {
        setConversationId(newConvId);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let botText = '';

      const botMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: botMessageId, role: 'assistant', content: botText }]);

      setIsLoading(false);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          botText += chunk;
          setMessages((prev) => 
            prev.map(m => m.id === botMessageId ? { ...m, content: botText } : m)
          );
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I encountered an error.' }]);
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        .nexus-chat-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .nexus-chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .nexus-chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        @media (prefers-color-scheme: dark) {
          .nexus-chat-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
          }
        }
      `}</style>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full flex justify-center items-center shadow-2xl transition-all hover:scale-110 hover:rotate-6 z-[99998] text-white active:scale-95 group"
        style={{ background: chatbot.theme || '#3b82f6' }}
      >
        {isOpen ? <X size={32} className="animate-in fade-in zoom-in duration-300" /> : <MessageSquare size={32} className="animate-in fade-in zoom-in duration-300" />}
      </button>

      {/* Chat Preview Window */}
      {isOpen && (
        <div className="fixed bottom-[110px] right-6 w-[380px] max-w-[calc(100vw-48px)] h-[min(600px,calc(100vh-180px))] flex flex-col bg-white dark:bg-[#121212] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden z-[99999] animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 border border-black/5 dark:border-white/5 origin-bottom-right">
          
          {/* Header */}
          <div 
            className="px-6 py-5 flex items-center justify-between text-white shadow-lg relative z-10"
            style={{ background: chatbot.theme || '#3b82f6' }}
          >
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot size={20} />
              </div>
              <h3 className="font-bold tracking-tight truncate text-lg leading-tight">
                {chatbot.name}
              </h3>
            </div>
            {/* Minimalist Close button inside header */}
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 shrink-0 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors active:scale-90"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-[#f8f9fa] dark:bg-[#0a0a0a] overflow-y-auto p-5 pb-8 space-y-4 nexus-chat-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-600 space-y-3 opacity-60 px-6">
                <div className="w-16 h-16 rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-2">
                    <Bot size={32} />
                </div>
                <p className="text-sm font-medium italic text-center leading-relaxed">
                  Test your setup. What would you like to ask?
                </p>
              </div>
            )}
            
            {messages.map(m => (
              <div key={m.id} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] rounded-[20px] px-4 py-2.5 text-[15px] leading-relaxed relative break-words ${
                  m.role === 'user' 
                    ? 'text-white rounded-br-sm shadow-md' 
                    : 'bg-white dark:bg-[#1e1e1e] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-bl-sm shadow-sm'
                }`}
                style={m.role === 'user' ? { background: chatbot.theme || '#3b82f6' } : {}}
                >
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                      <ReactMarkdown>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
               <div className="flex flex-col gap-1 items-start animate-in fade-in duration-300">
                  <div className="px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-full flex items-center gap-2">
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none translate-y-[0px]">Searching knowledge...</span>
                  </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSubmit} 
            className="p-4 bg-white dark:bg-[#121212] border-t border-zinc-100 dark:border-zinc-800 flex gap-2.5 items-center relative z-10"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ask anything..."
              className="flex-1 px-4 py-3 bg-[#f8f9fa] dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm dark:focus:bg-[#242424]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-11 h-11 shrink-0 flex justify-center items-center rounded-full text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
              style={{ background: chatbot.theme || '#3b82f6' }}
            >
              <Send size={18} />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
