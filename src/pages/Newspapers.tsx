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
    <div className="max-w-7xl mx-auto">
      <header className="mb-16">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-accent bg-accent/5 px-4 py-2 rounded-full border border-accent/10 mb-6">
           <NewspaperIcon size={12} /> Digital Newspaper Archives
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 tracking-tight">The Daily Ledger</h1>
        <p className="text-text-secondary max-w-2xl mb-10 font-serif text-lg leading-relaxed">
          Access the analyzed and structured digital editions of our daily newspaper archives. Professional summaries generated via Gemini AI.
        </p>

        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between border-y border-border py-8">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search editions by title or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none py-3 pl-8 pr-4 outline-none text-lg font-serif placeholder:font-serif italic"
            />
          </div>

          <div className="flex border border-border rounded-lg p-1 gap-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'grid' ? "bg-text-primary text-bg-page" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'list' ? "bg-text-primary text-bg-page" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-text-secondary">
           <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="font-serif italic">Accessing digital vaults...</p>
        </div>
      ) : filteredNewspapers.length > 0 ? (
        <div className={cn(
          "grid gap-8 pb-20",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredNewspapers.map((item, idx) => (
            viewMode === 'grid' ? (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-surface border border-border rounded-[2rem] p-8 hover:border-accent transition-all shadow-sm hover:shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="flex items-center gap-3 mb-6 relative">
                   <div className="w-10 h-10 bg-bg-page rounded-xl border border-border flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-bg-page transition-colors">
                      <Calendar size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{item.date}</p>
                      <p className="text-[9px] font-bold uppercase tracking-tighter text-accent">Daily Edition</p>
                   </div>
                </div>

                <h3 className="text-2xl font-serif font-bold mb-4 group-hover:text-accent transition-colors leading-tight relative">
                  {item.title}
                </h3>
                
                <p className="text-text-secondary text-sm font-serif line-clamp-3 mb-8 relative">
                   {item.content.substring(0, 150)}...
                </p>

                <Link 
                  to={`/newspaper/${item.id}`}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-primary border-b-2 border-text-primary pb-1 group/link hover:gap-4 transition-all relative"
                >
                  Read Edition <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-6 bg-surface border border-border rounded-2xl hover:border-accent transition-all group"
              >
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bg-bg-page rounded-xl border border-border flex items-center justify-center text-text-secondary group-hover:bg-accent group-hover:text-bg-page transition-colors">
                      <NewspaperIcon size={20} />
                   </div>
                   <div>
                      <h3 className="font-serif font-bold text-xl group-hover:text-accent transition-colors">{item.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                         <span className="flex items-center gap-1"><Calendar size={12} /> {item.date}</span>
                         <span className="flex items-center gap-1"><Clock size={12} /> Digital Archive</span>
                      </div>
                   </div>
                </div>
                <Link 
                  to={`/newspaper/${item.id}`}
                  className="p-3 bg-bg-page border border-border rounded-xl text-text-secondary hover:text-accent hover:border-accent transition-all"
                >
                   <ExternalLink size={18} />
                </Link>
              </motion.div>
            )
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-surface rounded-[3rem] border border-border border-dashed">
           <NewspaperIcon size={48} className="mx-auto text-text-secondary/20 mb-6" />
           <h3 className="text-2xl font-serif font-bold text-text-secondary italic">Vault Empty</h3>
           <p className="text-text-secondary font-serif max-w-sm mx-auto mt-2">No newspaper editions found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}
