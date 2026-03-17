"use client";

import { use, useState, useEffect } from 'react';
import { Copy, Check, Code, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WidgetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const [chatbot, setChatbot] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchChatbot() {
      const res = await fetch(`/api/chatbots`);
      const chatbots = await res.json();
      const found = chatbots.find((c: any) => c.id === id);
      setChatbot(found);
    }
    fetchChatbot();
  }, [id]);

  if (!chatbot) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const embedCode = `<script 
  src="${baseUrl}/widget/chat-widget.js" 
  data-chatbot-key="${chatbot.apiKey}" 
  data-api-url="${baseUrl}/api"
  defer
></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass border border-white/5 rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-3 text-blue-400">
          <Code size={24} />
          <h2 className="text-2xl font-bold text-white">Embed Your Chatbot</h2>
        </div>
        
        <p className="text-zinc-400">
          To add the chatbot to your website, copy and paste the following script tag into your HTML's <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">{'<head>'}</code> or just before the closing <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">{'</body>'}</code> tag.
        </p>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-zinc-950 rounded-xl p-6 border border-white/10 overflow-x-auto">
            <pre className="text-blue-300 font-mono text-sm leading-relaxed">
              {embedCode}
            </pre>
            <button 
              onClick={copyToClipboard}
              className="absolute top-4 right-4 p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all active:scale-95"
            >
              {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <h4 className="text-white font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Automatic Updates
            </h4>
            <p className="text-sm text-zinc-400">Any changes you make to the theme, knowledge base, or AI settings will reflect instantly on your website without changing the code.</p>
          </div>
          <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <h4 className="text-white font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Secure Integration
            </h4>
            <p className="text-sm text-zinc-400">Each chatbot uses a unique API key. You can reset this key at any time from the settings if you suspect it has been compromised.</p>
          </div>
        </div>
      </div>

      <div className="glass border border-white/5 rounded-2xl p-8 bg-zinc-900/50">
        <h3 className="text-lg font-bold text-white mb-4">Implementation Tips</h3>
        <ul className="space-y-3">
          {[
            'Make sure your website allows external scripts if you have a strict Content Security Policy (CSP).',
            'The widget is responsive and will automatically adapt to mobile screens.',
            'You can test the widget locally by including it in your development environment.',
          ].map((tip, i) => (
            <li key={i} className="flex gap-3 text-sm text-zinc-400">
              <span className="text-blue-500 font-bold">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
