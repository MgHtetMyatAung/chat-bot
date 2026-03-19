"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Bot, Zap, Shield, Sparkles, MessageSquare, ArrowRight, Play, Database, Globe, Menu, X, Code } from 'lucide-react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">May Myan <span className="text-blue-500">AI</span></span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
            <div className="flex items-center gap-4 ml-4">
              <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sign In</Link>
              <Link href="/dashboard" className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-slate-200 transition-all shadow-lg shadow-white/10">Get Started</Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu drawer Overlay */}
      <div className={`md:hidden fixed inset-y-0 right-0 w-[85%] max-w-[320px] h-[100dvh] bg-slate-950/98 backdrop-blur-3xl z-[100] border-l border-white/10 p-8 flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-2xl ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6 shrink-0">
           <span className="font-bold text-xl tracking-tight text-white">May Myan <span className="text-blue-500">AI</span></span>
           <button onClick={() => setIsMenuOpen(false)} className="p-2.5 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl hover:bg-white/10">
             <X size={24} />
           </button>
        </div>
        <div className="flex flex-col gap-8 text-xl font-bold text-slate-300 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <a href="#features" onClick={() => setIsMenuOpen(false)} className="hover:text-white hover:translate-x-2 transition-all flex items-center justify-between group">
            <span className="flex items-center gap-4">
              <Zap size={22} className="text-blue-500" />
              Features
            </span>
            <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-500" />
          </a>
          <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="hover:text-white hover:translate-x-2 transition-all flex items-center justify-between group">
            <span className="flex items-center gap-4">
              <Play size={22} className="text-blue-500" />
              How it Works
            </span>
            <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-500" />
          </a>
          <a href="/pricing" onClick={() => setIsMenuOpen(false)} className="hover:text-white hover:translate-x-2 transition-all flex items-center justify-between group">
             <span className="flex items-center gap-4">
               <Shield size={22} className="text-blue-500" />
               Pricing
             </span>
             <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-500" />
          </a>
        </div>
        <div className="pt-8 mt-auto border-t border-white/10 space-y-4 shrink-0">
          <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center text-slate-400 hover:text-white transition-colors font-medium py-2">Sign In</Link>
          <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="block w-full py-4 bg-white text-black font-bold rounded-2xl text-center shadow-xl shadow-white/10 active:scale-[0.98] transition-all text-lg tracking-tight">
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Drawer Backdrop */}
      {isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/90 backdrop-blur-md z-[90] animate-in fade-in duration-500"
        />
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-[-10%] w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Sparkles size={14} />
            The Future of Customer Support
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.2] sm:leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 px-4">
            Your Knowledge Base, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-purple-400">Powered by AI.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 px-6">
            May Myan AI learns from your documents, links, and PDFs to provide instant, accurate answers to your customers 24/7.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Link href="/dashboard" className="w-full sm:w-auto group px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 text-lg">
              Launch Your Chatbot
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-900/50 hover:bg-slate-800 border border-white/5 text-white font-bold rounded-2xl transition-all backdrop-blur-sm flex items-center justify-center gap-2 text-lg">
              <Play size={20} className="fill-current" />
              Watch Demo
            </button>
          </div>

          <div className="mt-12 md:mt-20 relative max-w-4xl mx-auto group animate-in fade-in zoom-in-95 duration-1000 delay-500 px-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-slate-900 border border-white/10 rounded-[2rem] p-4 shadow-2xl overflow-hidden aspect-[16/10] sm:aspect-video flex items-center justify-center">
               {/* Mockup Placeholder */}
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
               <Bot size={80} className="text-blue-500/20 md:w-[120px] md:h-[120px]" />
               <div className="absolute bottom-4 sm:bottom-8 left-4 right-4 sm:left-8 sm:right-8 p-3 sm:p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] sm:text-xs text-white font-bold tracking-tight">AI Assistant</p>
                       <p className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-widest">Active & Learning</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-24 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need <br className="hidden sm:block" /> to support your customers.</h2>
            <p className="text-slate-400 text-sm sm:text-base">Powerful features to help you automate support without losing the personal touch.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { 
                title: 'Instant Ingestion', 
                desc: 'Paste your custom text and train your AI. Our system processes it and learns it all in seconds.', 
                icon: Zap,
                color: 'text-amber-400'
              },
              { 
                title: 'Live Preview', 
                desc: 'Test your chatbot in our sandbox. Adjust prompts and see changes in real-time.', 
                icon: Play,
                color: 'text-blue-400'
              },
              { 
                title: 'Universal Widget', 
                desc: 'One line of code to deploy. Works with any website platform or framework.', 
                icon: Code,
                color: 'text-purple-400'
              },
              { 
                title: 'Multi-Model Support', 
                desc: 'Choose from GPT-4o, Claude 3, and more via OpenRouter integration.', 
                icon: Bot,
                color: 'text-emerald-400'
              },
              { 
                title: 'Advanced Analytics', 
                desc: 'Track every conversation. Learn what your customers are asking for.', 
                icon: Database,
                color: 'text-rose-400'
              },
              { 
                title: 'Cross-Origin Safe', 
                desc: 'Enterprise-grade security and API key management for all your domains.', 
                icon: Globe,
                color: 'text-cyan-400'
              }
            ].map((feat, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feat.color}`}>
                  <feat.icon size={24} />
                </div>
                <h4 className="text-xl font-bold mb-3">{feat.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">May Myan AI</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 May Myan AI System. Built for the modern web.</p>
          <div className="flex gap-6 text-slate-500 hover:text-white transition-colors">
            <Link href="/privacy" className="text-sm">Privacy</Link>
            <Link href="/terms" className="text-sm">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
