"use client";

import { useState, useEffect } from 'react';
import { Plus, Bot, Globe, MoreVertical, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ChatbotsPage() {
  const [chatbots, setChatbots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful customer support assistant.');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      const res = await fetch('/api/chatbots');
      if (res.ok) {
        const data = await res.json();
        setChatbots(data);
      }
    } catch (e) {
      console.error('Failed to fetch chatbots', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/chatbots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, siteUrl, systemPrompt })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setSiteUrl('');
        setSystemPrompt('You are a helpful customer support assistant.');
        fetchChatbots();
      }
    } catch (e) {
      console.error('Failed to create chatbot', e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Chatbots</h1>
          <p className="text-zinc-400 mt-2 text-sm sm:text-base">Manage AI assistants across all your websites.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-all shadow-lg shadow-white/10 w-full sm:w-auto"
        >
          <Plus size={18} />
          Create Chatbot
        </button>
      </div>

      <div className="glass border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search chatbots..." 
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="animate-spin text-zinc-500" size={32} />
          </div>
        ) : chatbots.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5 mb-4">
              <Bot size={32} className="text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold text-white">No chatbots found</h3>
            <p className="text-zinc-400 mt-2 max-w-sm">You haven't created any AI assistants yet. Create your first chatbot to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map(bot => (
              <Link href={`/dashboard/chatbots/${bot.id}`} key={bot.id} className="group glass-card border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all block relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all" />
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                    <Bot size={24} style={{ color: bot.theme }} />
                  </div>
                  <button className="text-zinc-500 hover:text-white transition-colors p-1">
                    <MoreVertical size={18} />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{bot.name}</h3>
                <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                  <Globe size={14} />
                  <span className="truncate">{bot.siteUrl}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card border border-white/10 rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Create New Chatbot</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Internal Name</label>
                  <input required value={name} onChange={(e)=>setName(e.target.value)} type="text" placeholder="Support Bot - Main Site" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Website URL</label>
                  <input required value={siteUrl} onChange={(e)=>setSiteUrl(e.target.value)} type="url" placeholder="https://example.com" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-1.5 block">System Prompt</label>
                  <textarea required value={systemPrompt} onChange={(e)=>setSystemPrompt(e.target.value)} rows={3} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50 text-sm resize-none"></textarea>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2">
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
