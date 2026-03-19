"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Link as LinkIcon, FilePlus, Loader2, Trash2, Upload, Globe, Check, CheckSquare, Square, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'LINK' | 'PDF' | 'CRAWL';
  createdAt: string;
}

export default function KnowledgeBasePage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [activeTab, setActiveTab] = useState<'TEXT' | 'LINK' | 'PDF' | 'CRAWL'>('TEXT');
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Crawl states
  const [urlToCrawl, setUrlToCrawl] = useState('');
  const [crawledLinks, setCrawledLinks] = useState<string[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [isCrawling, setIsCrawling] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);

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
      formData.append('title', title || (activeTab === 'LINK' ? content : 'Untitled'));
      formData.append('type', activeTab);
      
      if (activeTab === 'PDF' && file) {
        formData.append('file', file);
      } else {
        formData.append('content', content.trim());
      }

      const res = await fetch('/api/knowledge', {
        method: 'POST',
        body: formData,
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

  const handleCrawl = async () => {
    if (!urlToCrawl) {
      toast.error('Please enter a URL');
      return;
    }
    
    setIsCrawling(true);
    setCrawledLinks([]);
    setSelectedLinks([]);
    
    try {
      const res = await fetch('/api/knowledge/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToCrawl }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to crawl');
      
      setCrawledLinks(data.links);
      setSelectedLinks(data.links); // Select all by default
      toast.success(`Found ${data.links.length} links!`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleAddSelectedLinks = async () => {
    if (selectedLinks.length === 0) {
      toast.error('No links selected');
      return;
    }
    
    setBulkAdding(true);
    let successCount = 0;
    
    const toastId = toast.loading(`Adding ${selectedLinks.length} links...`);
    
    for (const url of selectedLinks) {
       try {
         const res = await fetch('/api/knowledge', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             chatbotId,
             title: url.split('/').pop() || url,
             type: 'CRAWL',
             content: url
           })
         });
         if (res.ok) successCount++;
       } catch (err) {
         console.error(`Failed to add ${url}`, err);
       }
    }
    
    toast.dismiss(toastId);
    toast.success(`Successfully added ${successCount} items!`);
    setBulkAdding(false);
    setIsAdding(false);
    setCrawledLinks([]);
    setSelectedLinks([]);
    setUrlToCrawl('');
    fetchItems();
  };

  const toggleLinkSelection = (url: string) => {
    setSelectedLinks(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
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
      case 'CRAWL': return <Globe size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LINK': return 'bg-blue-500/10 text-blue-400';
      case 'PDF': return 'bg-amber-500/10 text-amber-400';
      case 'CRAWL': return 'bg-purple-500/10 text-purple-400';
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
          <div className="flex bg-zinc-900 rounded-lg p-1 w-full max-w-md overflow-x-auto">
            {[
              { id: 'TEXT' as const, label: 'Text', icon: FileText },
              { id: 'LINK' as const, label: 'URL', icon: LinkIcon },
              { id: 'CRAWL' as const, label: 'Crawl Website', icon: Globe },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setContent('');
                  setTitle('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {(activeTab === 'TEXT' || activeTab === 'LINK' || activeTab === 'PDF') && (
            <form onSubmit={handleAdd} className="space-y-4 max-w-xl">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Title</label>
                <input value={title} onChange={(e)=>setTitle(e.target.value)} type="text" placeholder={activeTab === 'TEXT' ? "e.g. Refund Policy" : "Optional title"} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50" />
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
                  <p className="text-xs text-zinc-500 mt-1.5">The system will visit this URL and extract its main content.</p>
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

               <button type="submit" disabled={saving} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors w-max disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20">
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
          )}

          {activeTab === 'CRAWL' && (
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-4">
                <label className="text-sm font-medium text-zinc-300 block">Website URL</label>
                <div className="flex gap-2">
                  <input 
                    value={urlToCrawl} 
                    onChange={(e)=>setUrlToCrawl(e.target.value)} 
                    type="url" 
                    placeholder="https://example.com" 
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50" 
                  />
                  <button 
                    onClick={handleCrawl} 
                    disabled={isCrawling}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap shadow-lg shadow-purple-500/20"
                  >
                    {isCrawling ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                    {isCrawling ? 'Crawling...' : 'Discover Links'}
                  </button>
                </div>
                <p className="text-xs text-zinc-500">We will find all internal links on this page for you to choose from.</p>
              </div>

              {crawledLinks.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-white">Discovered Pages ({crawledLinks.length})</h3>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setSelectedLinks(crawledLinks)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Select All
                      </button>
                      <button 
                        onClick={() => setSelectedLinks([])}
                        className="text-xs text-zinc-500 hover:text-zinc-400"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900/50 border border-white/5 rounded-xl max-h-60 overflow-y-auto custom-scrollbar">
                    {crawledLinks.map((link, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => toggleLinkSelection(link)}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                      >
                        {selectedLinks.includes(link) ? (
                          <CheckSquare size={18} className="text-purple-500" />
                        ) : (
                          <Square size={18} className="text-zinc-600" />
                        )}
                        <span className="text-xs text-zinc-300 truncate">{link}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-zinc-500">
                      {selectedLinks.length} items selected for addition
                    </p>
                    <button 
                      onClick={handleAddSelectedLinks}
                      disabled={bulkAdding || selectedLinks.length === 0}
                      className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-white/5"
                    >
                      {bulkAdding ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      {bulkAdding ? 'Processing...' : 'Add Selected Pages'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="glass border border-white/5 rounded-2xl overflow-x-auto no-scrollbar scrollbar-hide">
        <table className="w-full text-left border-collapse min-w-[600px]">
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
                <tr key={item.id} className="border-t border-white/5 hover:bg-white/5 transition-colors group">
                   <td className="p-4 flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getTypeColor(item.type)}`}>
                       {getTypeIcon(item.type)}
                     </div>
                     <div className="min-w-0">
                       <span className="text-white text-sm font-medium block truncate max-w-[140px] xs:max-w-[200px] sm:max-w-md">{item.title}</span>
                       <span className="text-zinc-500 text-xs line-clamp-1 max-w-[140px] xs:max-w-[200px] sm:max-w-md block">
                         {(item.content || '').slice(0, 80)}{(item.content?.length || 0) > 80 ? '...' : ''}
                       </span>
                     </div>
                   </td>
                   <td className="p-4">
                     <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${getTypeColor(item.type)}`}>
                       {item.type}
                     </span>
                   </td>
                   <td className="p-4 text-sm text-zinc-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="text-zinc-500 hover:text-red-400 p-2 transition-colors hover:bg-red-500/10 rounded-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                      >
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


