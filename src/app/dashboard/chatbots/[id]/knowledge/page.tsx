"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Link as LinkIcon, FilePlus, Loader2, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'LINK' | 'PDF';
  createdAt: string;
}

export default function KnowledgeBasePage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [activeTab, setActiveTab] = useState<'TEXT' | 'LINK' | 'PDF'>('TEXT');
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/knowledge?chatbotId=${chatbotId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load knowledge base');
    } finally {
      setLoading(false);
    }
  }, [chatbotId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'PDF' && !file) {
      toast.error('Please select a PDF file');
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('chatbotId', chatbotId);
      formData.append('title', title);
      formData.append('type', activeTab);
      
      if (activeTab === 'PDF' && file) {
        formData.append('file', file);
      } else {
        formData.append('content', content);
      }

      const res = await fetch('/api/knowledge', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header when sending FormData, 
        // the browser will set it with the correct boundary
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      toast.success('Knowledge item saved!');
      setTitle('');
      setContent('');
      setFile(null);
      setIsAdding(false);
      fetchItems();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save knowledge item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch(`/api/knowledge?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      toast.success('Item deleted');
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete item');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please upload a valid PDF file');
        return;
      }
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.replace('.pdf', ''));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LINK': return <LinkIcon size={16} />;
      case 'PDF': return <FilePlus size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LINK': return 'bg-blue-500/10 text-blue-400';
      case 'PDF': return 'bg-amber-500/10 text-amber-400';
      default: return 'bg-emerald-500/10 text-emerald-400';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Knowledge Base</h2>
          <p className="text-zinc-400 text-sm">Add data here to provide your chatbot with custom context.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-semibold rounded-xl hover:bg-zinc-200 transition-all shadow-lg shadow-white/10"
        >
          <FilePlus size={16} />
          {isAdding ? 'Cancel' : 'Add Knowledge'}
        </button>
      </div>

      {isAdding && (
        <div className="glass border border-white/10 rounded-2xl p-6 space-y-6 bg-blue-500/5 animate-in zoom-in-95 duration-200">
          <div className="flex bg-zinc-900 rounded-lg p-1 w-full max-w-sm">
            {[
              { id: 'TEXT' as const, label: 'Custom Text', icon: FileText },
              // { id: 'LINK' as const, label: 'Docs Link', icon: LinkIcon },
              // { id: 'PDF' as const, label: 'PDF File', icon: FilePlus }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setContent('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab.id ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleAdd} className="space-y-4 max-w-xl">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Title</label>
              <input required value={title} onChange={(e)=>setTitle(e.target.value)} type="text" placeholder="e.g. Refund Policy" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50" />
            </div>

            {activeTab === 'TEXT' && (
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Content</label>
                <textarea required value={content} onChange={(e)=>setContent(e.target.value)} rows={6} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50 text-sm resize-none" placeholder="Enter the text content here..."></textarea>
              </div>
            )}

            {activeTab === 'LINK' && (
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">URL to Scrape</label>
                <input required value={content} onChange={(e)=>setContent(e.target.value)} type="url" placeholder="https://example.com/pricing" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50" />
                <p className="text-xs text-zinc-500 mt-1.5">The system will visit this URL and extract the page content for the chatbot.</p>
              </div>
            )}

            {activeTab === 'PDF' && (
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Upload PDF</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  className="hidden" 
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors cursor-pointer text-center group"
                >
                  <Upload className={`mb-2 transition-colors ${file ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} size={32} />
                  <p className="text-sm text-zinc-300">
                    {file ? `Selected: ${file.name}` : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">PDF max size 10MB</p>
                </div>
              </div>
            )}

             <button type="submit" disabled={saving} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors w-max disabled:opacity-50 flex items-center gap-2">
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Save to Knowledge Base'
              )}
             </button>
          </form>
        </div>
      )}

      <div className="glass border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-zinc-400 text-xs uppercase tracking-wider">
              <th className="font-medium p-4">Title</th>
              <th className="font-medium p-4">Type</th>
              <th className="font-medium p-4">Added On</th>
              <th className="font-medium p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">
                  <FileText size={24} className="mx-auto mb-2 opacity-50" />
                  No knowledge items yet. Click &quot;Add Knowledge&quot; to get started.
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                   <td className="p-4 flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(item.type)}`}>
                       {getTypeIcon(item.type)}
                     </div>
                     <div>
                       <span className="text-white text-sm font-medium block">{item.title}</span>
                       <span className="text-zinc-500 text-xs line-clamp-1 max-w-xs block">
                         {(item.content || '').slice(0, 80)}{(item.content?.length || 0) > 80 ? '...' : ''}
                       </span>
                     </div>
                   </td>
                   <td className="p-4">
                     <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${getTypeColor(item.type)}`}>
                       {item.type}
                     </span>
                   </td>
                   <td className="p-4 text-sm text-zinc-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                   <td className="p-4 text-right">
                     <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 p-2 transition-colors hover:bg-red-500/10 rounded-lg">
                       <Trash2 size={16} />
                     </button>
                   </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

