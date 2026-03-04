import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Grid, 
  List, 
  Filter, 
  Tag, 
  Folder, 
  Star, 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  File, 
  StickyNote,
  MoreVertical,
  Trash2,
  ExternalLink,
  ChevronRight,
  X,
  Upload,
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIEntry, EntryType } from './types';
import { vaultService } from './services/vaultService';

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick, 
  count 
}: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-vault-accent/10 text-vault-accent border border-vault-accent/20' 
        : 'text-vault-text-secondary hover:bg-vault-border hover:text-vault-text-primary'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </div>
    {count !== undefined && (
      <span className="text-[10px] font-mono opacity-50">{count}</span>
    )}
  </button>
);

const EntryCard = ({ 
  entry, 
  onToggleFavorite, 
  onDelete,
  onClick
}: any) => {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = (type: EntryType) => {
    switch (type) {
      case 'text': return <FileText size={16} />;
      case 'image': return <ImageIcon size={16} />;
      case 'document': return <File size={16} />;
      case 'note': return <StickyNote size={16} />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative glass-panel rounded-xl overflow-hidden hover:border-vault-accent/50 transition-all duration-300 cursor-pointer"
      onClick={() => onClick(entry)}
    >
      {/* Type Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2 py-1 rounded-md bg-vault-bg/60 backdrop-blur-sm border border-vault-border text-[10px] uppercase tracking-wider font-mono text-vault-text-secondary">
        {getIcon(entry.type)}
        {entry.type}
      </div>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(entry.id, !entry.is_favorite);
        }}
        className={`absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all duration-200 ${
          entry.is_favorite 
            ? 'text-yellow-500 bg-yellow-500/10' 
            : 'text-vault-text-secondary hover:text-vault-text-primary bg-vault-bg/60 opacity-0 group-hover:opacity-100'
        }`}
      >
        <Star size={16} fill={entry.is_favorite ? "currentColor" : "none"} />
      </button>

      {/* Content Preview */}
      <div className="aspect-video w-full bg-vault-bg flex items-center justify-center overflow-hidden border-b border-vault-border">
        {entry.type === 'image' && entry.content ? (
          <img 
            src={entry.content} 
            alt={entry.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="p-6 w-full h-full flex flex-col justify-center">
            <p className="text-xs text-vault-text-secondary line-clamp-4 font-mono leading-relaxed">
              {entry.content || "No content preview available"}
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-sm mb-1 truncate group-hover:text-vault-accent transition-colors">
          {entry.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-vault-text-secondary font-mono">
            {new Date(entry.created_at).toLocaleDateString()}
          </span>
          <div className="flex gap-1">
            {entry.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-vault-border text-vault-text-secondary">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AddEntryModal = ({ 
  isOpen, 
  onClose, 
  onAdd 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onAdd: (entry: any) => void 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'text' as EntryType,
    source_tool: '',
    category: 'General',
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    });
    setFormData({ title: '', content: '', type: 'text', source_tool: '', category: 'General', tags: '' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          content: reader.result as string,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          title: prev.title || file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg glass-panel rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-vault-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-vault-accent/10 text-vault-accent">
              <Plus size={20} />
            </div>
            <h2 className="text-lg font-semibold">Add to Vault</h2>
          </div>
          <button onClick={onClose} className="text-vault-text-secondary hover:text-vault-text-primary">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-mono">Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as EntryType})}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vault-accent"
              >
                <option value="text">Text / Prompt</option>
                <option value="image">Image</option>
                <option value="document">Document</option>
                <option value="note">Note</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-mono">Source Tool</label>
              <input 
                type="text"
                placeholder="e.g. ChatGPT, Midjourney"
                value={formData.source_tool}
                onChange={e => setFormData({...formData, source_tool: e.target.value})}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vault-accent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-mono">Title</label>
            <input 
              required
              type="text"
              placeholder="Give your memory a name..."
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vault-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-mono">Content / File</label>
            {formData.type === 'image' || formData.type === 'document' ? (
              <div className="relative group">
                <input 
                  type="file" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full h-32 border-2 border-dashed border-vault-border rounded-xl flex flex-col items-center justify-center gap-2 group-hover:border-vault-accent transition-colors">
                  <Upload size={24} className="text-vault-text-secondary group-hover:text-vault-accent" />
                  <span className="text-xs text-vault-text-secondary">Click or drag to upload</span>
                </div>
              </div>
            ) : (
              <textarea 
                required
                rows={4}
                placeholder="Paste your AI output here..."
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vault-accent resize-none font-mono"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-mono">Category</label>
              <input 
                type="text"
                placeholder="e.g. Work, Creative"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vault-accent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-mono">Tags (comma separated)</label>
              <input 
                type="text"
                placeholder="ai, research, prompt"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vault-accent"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-vault-accent hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-vault-accent/20 mt-2"
          >
            Save to Vault
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const EntryDetail = ({ 
  entry, 
  onClose,
  onDelete,
  onUpdate
}: { 
  entry: AIEntry, 
  onClose: () => void,
  onDelete: (id: number) => void,
  onUpdate: (id: number, updates: any) => void
}) => {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-y-0 right-0 w-full max-w-xl glass-panel z-50 shadow-2xl flex flex-col"
    >
      <div className="p-6 border-b border-vault-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-vault-border rounded-lg transition-colors">
            <ChevronRight size={20} />
          </button>
          <h2 className="text-lg font-semibold truncate max-w-[300px]">{entry.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to delete this memory?')) {
                onDelete(entry.id);
                onClose();
              }
            }}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="space-y-8">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-mono">Source Tool</span>
              <p className="text-sm font-medium flex items-center gap-2">
                <BrainCircuit size={14} className="text-vault-accent" />
                {entry.source_tool || 'Unknown'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-mono">Category</span>
              <p className="text-sm font-medium">{entry.category || 'General'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-mono">Created</span>
              <p className="text-sm font-medium">{new Date(entry.created_at).toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-mono">Type</span>
              <p className="text-sm font-medium capitalize">{entry.type}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-mono">Tags</span>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map(tag => (
                <span key={tag} className="px-2 py-1 rounded-md bg-vault-border text-xs text-vault-text-secondary border border-vault-border/50">
                  #{tag}
                </span>
              ))}
              {entry.tags.length === 0 && <span className="text-xs text-vault-text-secondary italic">No tags</span>}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-mono">Content</span>
            <div className="p-6 rounded-2xl bg-vault-bg border border-vault-border">
              {entry.type === 'image' ? (
                <img 
                  src={entry.content} 
                  alt={entry.title} 
                  className="w-full rounded-lg shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-vault-text-secondary">
                  {entry.content}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [entries, setEntries] = useState<AIEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AIEntry | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await vaultService.getEntries();
      setEntries(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (newEntry: any) => {
    try {
      const saved = await vaultService.createEntry(newEntry);
      setEntries([saved, ...entries]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleFavorite = async (id: number, isFavorite: boolean) => {
    try {
      const updated = await vaultService.toggleFavorite(id, isFavorite);
      setEntries(entries.map(e => e.id === id ? updated : e));
      if (selectedEntry?.id === id) setSelectedEntry(updated);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      await vaultService.deleteEntry(id);
      setEntries(entries.filter(e => e.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'favorites') return entry.is_favorite && matchesSearch;
    if (filter === 'text' || filter === 'image' || filter === 'document' || filter === 'note') {
      return entry.type === filter && matchesSearch;
    }
    return matchesSearch;
  });

  const categories: string[] = Array.from(new Set(entries.map(e => (e.category || 'General') as string)));

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-vault-border flex flex-col bg-vault-card/30 backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-vault-accent flex items-center justify-center shadow-lg shadow-vault-accent/20">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight">OmniVault</h1>
              <p className="text-[10px] text-vault-text-secondary font-mono uppercase tracking-widest">AI Memory</p>
            </div>
          </div>

          <div className="space-y-1">
            <SidebarItem 
              icon={Grid} 
              label="All Memories" 
              active={filter === 'all'} 
              onClick={() => setFilter('all')} 
              count={entries.length}
            />
            <SidebarItem 
              icon={Star} 
              label="Favorites" 
              active={filter === 'favorites'} 
              onClick={() => setFilter('favorites')} 
              count={entries.filter(e => e.is_favorite).length}
            />
          </div>

          <div className="mt-8">
            <h3 className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-mono mb-4 px-3">Types</h3>
            <div className="space-y-1">
              <SidebarItem icon={FileText} label="Text & Prompts" active={filter === 'text'} onClick={() => setFilter('text')} />
              <SidebarItem icon={ImageIcon} label="Images" active={filter === 'image'} onClick={() => setFilter('image')} />
              <SidebarItem icon={File} label="Documents" active={filter === 'document'} onClick={() => setFilter('document')} />
              <SidebarItem icon={StickyNote} label="Notes" active={filter === 'note'} onClick={() => setFilter('note')} />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-[10px] uppercase tracking-wider text-vault-text-secondary font-mono mb-4 px-3">Categories</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
              {categories.map(cat => (
                <SidebarItem 
                  key={cat}
                  icon={Folder} 
                  label={cat} 
                  active={filter === cat} 
                  onClick={() => setFilter(cat)} 
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-vault-border">
          <div className="p-4 rounded-xl bg-vault-accent/5 border border-vault-accent/10">
            <p className="text-[10px] text-vault-text-secondary mb-2">Vault Capacity</p>
            <div className="w-full h-1 bg-vault-border rounded-full overflow-hidden">
              <div className="bg-vault-accent h-full w-1/4" />
            </div>
            <p className="text-[9px] text-vault-text-secondary mt-2 font-mono">12.4 MB / 500 MB</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-vault-bg">
        {/* Header */}
        <header className="h-20 border-b border-vault-border flex items-center justify-between px-8 bg-vault-bg/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex-1 max-w-2xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vault-text-secondary group-focus-within:text-vault-accent transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search your AI memories, prompts, tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-vault-card border border-vault-border rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-vault-accent transition-all"
            />
          </div>

          <div className="flex items-center gap-4 ml-8">
            <div className="flex items-center bg-vault-card border border-vault-border rounded-lg p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-vault-border text-vault-text-primary' : 'text-vault-text-secondary hover:text-vault-text-primary'}`}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-vault-border text-vault-text-primary' : 'text-vault-text-secondary hover:text-vault-text-primary'}`}
              >
                <List size={18} />
              </button>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-vault-accent hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-vault-accent/20"
            >
              <Plus size={18} />
              <span>Add Memory</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-vault-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-vault-text-secondary font-mono">Accessing Vault...</p>
            </div>
          ) : filteredEntries.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              <AnimatePresence mode="popLayout">
                {filteredEntries.map(entry => (
                  <EntryCard 
                    key={entry.id}
                    entry={entry} 
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={handleDeleteEntry}
                    onClick={setSelectedEntry}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-vault-border flex items-center justify-center mb-6">
                <Search size={40} className="text-vault-text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No memories found</h3>
              <p className="text-vault-text-secondary text-sm mb-8">
                {searchQuery 
                  ? `We couldn't find anything matching "${searchQuery}". Try a different search term.`
                  : "Your vault is empty. Start saving your AI-generated content to keep it organized and accessible."}
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 text-vault-accent hover:underline font-medium"
                >
                  <Plus size={18} />
                  <span>Create your first entry</span>
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals & Details */}
      <AddEntryModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddEntry} 
      />
      
      <AnimatePresence>
        {selectedEntry && (
          <EntryDetail 
            entry={selectedEntry} 
            onClose={() => setSelectedEntry(null)} 
            onDelete={handleDeleteEntry}
            onUpdate={async (id, updates) => {
              const updated = await vaultService.updateEntry(id, updates);
              setEntries(entries.map(e => e.id === id ? updated : e));
              setSelectedEntry(updated);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
