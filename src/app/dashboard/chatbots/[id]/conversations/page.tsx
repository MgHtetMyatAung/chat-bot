"use client";

import { use, useState, useEffect, useCallback } from 'react';
import { MessageSquare, Loader2, Trash2, Calendar, User, Bot, ChevronRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  visitorId: string;
  updatedAt: string;
  messages: Message[];
}

export default function ConversationsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations?chatbotId=${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleDelete = async (convoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const res = await fetch(`/api/conversations?id=${convoId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Conversation deleted');
      setConversations(prev => prev.filter(c => c.id !== convoId));
      if (selectedId === convoId) setSelectedId(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete');
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedId);
  
  const filteredConversations = conversations.filter(c => 
    c.visitorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.messages.some(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex bg-zinc-950/50 border border-white/5 rounded-2xl overflow-hidden h-[calc(100vh-280px)] min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar List */}
      <div className="w-1/3 border-r border-white/5 flex flex-col bg-zinc-900/30">
        <div className="p-4 border-b border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-zinc-500" />
              History
            </h3>
            <span className="text-[10px] font-bold bg-white/5 text-zinc-500 px-2 py-0.5 rounded-full">
              {conversations.length} CONVOS
            </span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..." 
              className="w-full bg-black/40 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/50" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 size={24} className="animate-spin text-zinc-700 mx-auto" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-zinc-600 space-y-2">
              <MessageSquare size={32} className="mx-auto opacity-20" />
              <p className="text-xs uppercase tracking-widest font-bold">No Records</p>
            </div>
          ) : (
            filteredConversations.map(convo => (
              <div 
                key={convo.id}
                onClick={() => setSelectedId(convo.id)}
                className={`p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 relative group ${selectedId === convo.id ? 'bg-blue-500/10 border-r-2 border-r-blue-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-zinc-400 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    <User size={12} />
                    {convo.visitorId.slice(0, 12)}...
                  </span>
                  <span className="text-[10px] text-zinc-600">{new Date(convo.updatedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-zinc-500 line-clamp-1 italic">
                  &quot;{convo.messages[convo.messages.length - 1]?.content || 'Empty'}&quot;
                </p>
                <button 
                  onClick={(e) => handleDelete(convo.id, e)}
                  className="absolute bottom-2 right-2 p-1.5 bg-red-500/10 text-red-500/40 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 flex flex-col bg-zinc-950/20 relative">
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 space-y-4">
            <div className="w-16 h-16 rounded-full border border-dashed border-white/10 flex items-center justify-center">
              <ChevronRight size={32} className="text-zinc-800" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">Select a session to view details</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Session: <span className="text-blue-400">{selectedConversation?.visitorId}</span>
                </h4>
                <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(selectedConversation?.updatedAt || '').toLocaleString()}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={10} /> {selectedConversation?.messages.length} messages</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {selectedConversation?.messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] space-y-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {m.role === 'assistant' ? (
                        <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center border border-white/10">
                          <Bot size={14} className="text-blue-400" />
                        </div>
                      ) : null}
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                        {m.role === 'assistant' ? 'AI Agent' : 'Visitor'}
                      </span>
                    </div>
                    <div className={`p-4 rounded-2xl text-[13px] leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-zinc-900 border border-white/5 text-zinc-300 rounded-tl-none'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>
    </div>
  );
}
