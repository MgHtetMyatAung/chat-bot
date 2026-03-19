"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, MessageSquare, Code, Settings, Play } from 'lucide-react';

interface Tab {
  name: string;
  href: string;
  icon: any;
}

export default function ChatbotTabs({ id }: { id: string }) {
  const pathname = usePathname();

  const tabs: Tab[] = [
    { name: 'Settings', href: `/dashboard/chatbots/${id}`, icon: Settings },
    { name: 'Knowledge Base', href: `/dashboard/chatbots/${id}/knowledge`, icon: FileText },
    { name: 'Conversations', href: `/dashboard/chatbots/${id}/conversations`, icon: MessageSquare },
    { name: 'Preview', href: `/dashboard/chatbots/${id}/preview`, icon: Play },
    { name: 'Widget', href: `/dashboard/chatbots/${id}/widget`, icon: Code },
  ];

  return (
    <div className="flex space-x-1 border-b border-white/5 relative overflow-x-auto scrollbar-hide no-scrollbar w-full whitespace-nowrap">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`
              relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300
              ${isActive 
                ? 'text-white bg-white/5' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}
            `}
          >
            <tab.icon size={16} className={isActive ? 'text-blue-400' : 'text-zinc-600'} />
            {tab.name}
            
            {/* Active Indicator Line */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 animate-in fade-in slide-in-from-left-full duration-500" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
