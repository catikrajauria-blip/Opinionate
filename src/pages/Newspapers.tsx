import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { newspaperService, Newspaper } from '../lib/newspaperService';
import { Calendar, ChevronRight, Newspaper as NewspaperIcon, Search, LayoutGrid, List as ListIcon, ExternalLink, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Newspapers() {
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    async function loadNewspapers() {
      try {
        const data = await newspaperService.getLatestNewspapers(50);
        setNewspapers(data);
      } catch (error) {
        console.error('Error loading newspapers:', error);
      } finally {
        setLoading(false);
      }
    }
    loadNewspapers();
  }, []);

  const filteredNewspapers = newspapers.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.date.includes(search)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <header className="mb-20">
        <div className="flex items-center gap-4 mb-10">
          <span className="w-12 h-px bg-accent" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent">PUBLIC_RECORD_OFFICIAL</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-display font-black mb-10 tracking-tighter uppercase leading-tight">
          The Daily Ledger
        </h1>
        <p className="text-text-secondary max-w-2xl mb-16 font-display font-bold text-xl md:text-2xl leading-tight uppercase tracking-tight">
          ACCESS SYSTEMATICALLY ANALYZED DIGITAL EDITIONS OF THE DAILY ARCHIVE. COMPILED AND VERIFIED VIA GEMINI AI CORE.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border border-border">
          <div className="md:col-span-8 p-6 md:p-10 border-b md:border-b-0 md:border-r border-border relative group">
            <Search className="absolute right-10 top-1/2 -translate-y-1/2 text-accent opacity-20 group-focus-within:opacity-100 transition-opacity" size={24} />
            <input 
              type="text" 
              placeholder="SEARCH_EDITIONS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-2xl md:text-4xl font-display font-black placeholder:text-border placeholder:font-display uppercase tracking-tighter"
            />
            <div className="text-[10px] font-mono font-black uppercase text-text-secondary mt-4 tracking-widest">QUERY FIELD [TITLE_DATE]</div>
          </div>

          <div className="md:col-span-4 p-8 flex items-center justify-center gap-6">
            <span className="text-[10px] font-mono font-bold uppercase text-text-secondary tracking-widest mr-auto md:hidden">VIEW_MODE</span>
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-4 border transition-all",
                viewMode === 'grid' ? "bg-accent border-accent text-bg-page" : "border-border text-text-secondary hover:border-accent"
              )}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-4 border transition-all",
                viewMode === 'list' ? "bg-accent border-accent text-bg-page" : "border-border text-text-secondary hover:border-accent"
              )}
            >
              <ListIcon size={20} />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="py-32 flex flex-col items-center gap-6">
          <div className="w-16 h-1 w-16 bg-border overflow-hidden">
             <motion.div 
               animate={{ x: [-64, 64] }} 
               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
               className="w-16 h-full bg-accent"
             />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-text-secondary">VAULT_ACCESSING...</span>
        </div>
      ) : filteredNewspapers.length > 0 ? (
        <div className={cn(
          "grid gap-px bg-border border border-border pb-20",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredNewspapers.map((item, idx) => (
            viewMode === 'grid' ? (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ 
                  y: -8, 
                  boxShadow: "0 30px 60px -12px rgba(0,0,0,0.25), 0 18px 36px -18px rgba(0,0,0,0.3)",
                }}
                transition={{ 
                  delay: idx * 0.05,
                  duration: 0.5,
                  ease: [0.23, 1, 0.32, 1],
                  y: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="group bg-bg-page p-10 hover:bg-surface transition-all relative overflow-hidden z-0 hover:z-10"
              >
                <div className="flex items-center justify-between mb-8">
                   <div className="w-12 h-12 border border-border flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-bg-page transition-colors">
                      <Calendar size={20} />
                   </div>
                   <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-text-secondary">#{idx + 100}</span>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent mb-2">EDITION_DATE: {item.date}</p>
                  <h3 className="text-3xl font-display font-black group-hover:text-accent transition-colors leading-tight uppercase tracking-tighter">
                    {item.title}
                  </h3>
                </div>
                
                <p className="text-text-secondary font-display font-black text-sm line-clamp-3 mb-10 uppercase tracking-tight">
                   {item.content.substring(0, 150)}...
                </p>

                <Link 
                  to={`/newspaper/${item.id}`}
                  className="btn-minimal w-full justify-between group/link font-mono"
                >
                  ACCESS_EDITION <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-8 bg-bg-page hover:bg-surface transition-all group border-b border-border last:border-b-0"
              >
                <div className="flex items-center gap-10">
                   <div className="text-2xl font-mono font-bold text-border group-hover:text-accent transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                   </div>
                   <div>
                      <h3 className="font-display font-black text-3xl group-hover:text-accent transition-colors uppercase tracking-tighter">{item.title}</h3>
                      <div className="flex items-center gap-6 mt-2">
                         <span className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary"><Calendar size={12} className="text-accent" /> {item.date}</span>
                         <span className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary"><Clock size={12} /> VERIFIED_ARCHIVE</span>
                      </div>
                   </div>
                </div>
                <Link 
                  to={`/newspaper/${item.id}`}
                  className="btn-minimal p-4 border-accent text-accent hover:bg-accent hover:text-bg-page"
                >
                   <ExternalLink size={20} />
                </Link>
              </motion.div>
            )
          ))}
        </div>
      ) : (
        <div className="py-32 text-center border-2 border-dashed border-border">
           <NewspaperIcon size={64} className="mx-auto text-border mb-8" />
           <h3 className="text-3xl font-display font-black uppercase tracking-tighter mb-4">VAULT_EMPTY</h3>
           <p className="text-text-secondary font-mono text-xs uppercase tracking-widest">NO NEWSPAPER EDITIONS MATCHING THE REQUESTED PARAMETERS WERE FOUND IN THE ARCHIVE.</p>
        </div>
      )}
    </div>
  );
}
