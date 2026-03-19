"use client";

import { prisma } from '@/lib/prisma';
import { notFound, useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { Save, Loader2, Trash2, ArrowLeft, Bot, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ChatbotSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();

  const [chatbot, setChatbot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // 'general' or 'ai'
  const [deleting, setDeleting] = useState(false);

  // General Settings State
  const [name, setName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  
  // AI Settings State
  const [modelId, setModelId] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [theme, setTheme] = useState('#3b82f6');

  useEffect(() => {
    async function fetchChatbot() {
      try {
        const res = await fetch(`/api/chatbots`);
        if (!res.ok) throw new Error();
        const chatbots = await res.json();
        const found = chatbots.find((c: any) => c.id === id);
        
        if (!found) {
          toast.error('Chatbot not found');
          router.push('/dashboard/chatbots');
          return;
        }

        setChatbot(found);
        setName(found.name);
        setSiteUrl(found.siteUrl);
        setModelId(found.modelId);
        setSystemPrompt(found.systemPrompt);
        setTheme(found.theme || '#3b82f6');
      } catch (err) {
        console.error(err);
        toast.error('Failed to load chatbot settings');
      } finally {
        setLoading(false);
      }
    }
    fetchChatbot();
  }, [id, router]);

  const handleUpdate = async (type: 'general' | 'ai') => {
    setSaving(type);
    try {
      const body = type === 'general' 
        ? { name, siteUrl }
        : { modelId, systemPrompt, theme };

      const res = await fetch(`/api/chatbots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Failed to update');
      
      toast.success('Settings updated successfully');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save changes');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/chatbots/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      toast.success('Chatbot deleted');
      router.push('/dashboard/chatbots');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete chatbot');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={32} className="animate-spin text-zinc-500" />
    </div>
  );

  if (!chatbot && !loading) return null;

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="glass border border-white/5 rounded-2xl p-6 space-y-6 bg-blue-500/5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Globe size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Interface</span>
              </div>
              <h2 className="text-xl font-bold text-white">General Settings</h2>
              <p className="text-zinc-400 text-sm">Manage internal name and target website.</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/5">
              <Settings size={20} className="text-zinc-400" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Chatbot Name</label>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                type="text" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Target Website URL</label>
              <input 
                value={siteUrl} 
                onChange={(e) => setSiteUrl(e.target.value)}
                type="url" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50" 
              />
            </div>
            <button 
              onClick={() => handleUpdate('general')}
              disabled={saving === 'general'}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 disabled:opacity-50"
            >
              {saving === 'general' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save General Changes
            </button>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="glass border border-white/5 rounded-2xl p-6 space-y-6 bg-purple-500/5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Bot size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Brain</span>
              </div>
              <h2 className="text-xl font-bold text-white">AI Configuration</h2>
              <p className="text-zinc-400 text-sm">Customize the model and behavior.</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/5">
              <Bot size={20} className="text-zinc-400" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Model ID</label>
                <input 
                  value={modelId} 
                  onChange={(e) => setModelId(e.target.value)}
                  type="text" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/50" 
                  placeholder="e.g. gpt-4o-mini" 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Accent Color</label>
                <div className="flex gap-3 items-center">
                   <input 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value)}
                    type="color" 
                    className="w-12 h-10 bg-transparent border-none cursor-pointer p-0" 
                  />
                  <input 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value)}
                    type="text" 
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white uppercase" 
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1.5 block">System Prompt</label>
              <textarea 
                value={systemPrompt} 
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={5} 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/50 text-sm resize-none"
              ></textarea>
            </div>
            <button 
              onClick={() => handleUpdate('ai')}
              disabled={saving === 'ai'}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {saving === 'ai' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Update AI Engine
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass border border-red-500/20 rounded-2xl p-6 bg-red-500/5">
        <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">Danger Zone</h3>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-white font-medium">Delete this chatbot</p>
            <p className="text-zinc-500 text-sm">Once you delete a chatbot, there is no going back. All knowledge and conversations will be lost.</p>
          </div>
          <button 
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all text-sm font-bold disabled:opacity-50"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

import { Settings } from 'lucide-react';

