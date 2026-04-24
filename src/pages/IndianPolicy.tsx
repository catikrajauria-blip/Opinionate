import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Factory, 
  HardHat, 
  ShieldCheck, 
  Cpu, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  ChevronRight,
  Filter,
  ExternalLink,
  Target,
  Zap
} from 'lucide-react';
import Layout from '../components/Layout';
import { policyService, PolicyUpdate } from '../lib/policyService';
import { cn } from '../lib/utils';

const SECTORS = [
  { name: 'Manufacturing', icon: Factory, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { name: 'Infrastructure', icon: HardHat, iconName: 'HardHat', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { name: 'Defence', icon: ShieldCheck, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { name: 'Tech', icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { name: 'Economy', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
] as const;

export default function IndianPolicy() {
  const [updates, setUpdates] = useState<PolicyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSector, setActiveSector] = useState<string | null>(null);

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      const data = await policyService.getAllUpdates();
      setUpdates(data);
    } catch (error) {
      console.error('Failed to load policy updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUpdates = activeSector 
    ? updates.filter(u => u.sector === activeSector)
    : updates;

  return (
    <div className="pt-32 pb-20">
      <div className="container-custom">
        {/* Header Section */}
          <div className="mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-accent/5 border border-accent/20 mb-8"
            >
              <Zap size={14} className="text-accent" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent">Strategic_Growth_Engine</span>
            </motion.div>
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="max-w-3xl">
                <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase leading-[0.85] mb-8">
                  Indian_Policy <br />
                  <span className="text-text-secondary opacity-30">GROWTH_TRACKER</span>
                </h1>
                <p className="text-xl text-text-secondary leading-relaxed font-medium uppercase tracking-tight max-w-2xl">
                  Real-time monitoring of government strategic initiatives and milestones across critical sectors driving the nation's expansion.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                 <div className="bg-surface border border-border p-6 min-w-[200px]">
                    <p className="text-[10px] font-mono font-bold text-text-secondary opacity-40 uppercase tracking-widest mb-2">ACTIVE_INITIATIVES</p>
                    <p className="text-4xl font-display font-black tracking-tighter">{updates.length}</p>
                 </div>
                 <div className="bg-surface border border-border p-6 min-w-[200px]">
                    <p className="text-[10px] font-mono font-bold text-text-secondary opacity-40 uppercase tracking-widest mb-2">LAST_COMMITTED</p>
                    <p className="text-4xl font-display font-black tracking-tighter">
                      {updates.length > 0 ? new Date(updates[0].date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }).toUpperCase() : '--'}
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {/* Sector Filter Bar */}
          <div className="mb-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 border border-border">
             {SECTORS.map((sector) => (
                <button
                  key={sector.name}
                  onClick={() => setActiveSector(activeSector === sector.name ? null : sector.name)}
                  className={cn(
                    "flex flex-col items-start p-8 transition-all relative overflow-hidden group border-r border-b lg:border-b-0 last:border-r-0",
                    activeSector === sector.name ? "bg-bg-page border-b-accent lg:border-b-4" : "bg-surface hover:bg-bg-page"
                  )}
                >
                   <sector.icon size={24} className={cn("mb-6 transition-transform group-hover:scale-110", sector.color, activeSector === sector.name ? "opacity-100" : "opacity-30")} />
                   <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary opacity-40 mb-2">SECTOR_MODULE</p>
                   <h3 className="text-xl font-display font-black uppercase tracking-tighter">{sector.name}</h3>
                   
                   {activeSector === sector.name && (
                      <motion.div layoutId="sector-highlight" className="absolute top-0 right-0 p-4">
                         <Target size={14} className="text-accent" />
                      </motion.div>
                   )}
                </button>
             ))}
          </div>

          {/* Timeline View */}
          <div className="relative">
             {/* Vertical Line */}
             <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />

             <div className="space-y-24">
                {loading ? (
                   Array(3).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center justify-center p-20 border border-dashed border-border">
                         <div className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.5em]">SYNCHRONIZING_TIMELINE...</div>
                      </div>
                   ))
                ) : filteredUpdates.length > 0 ? (
                   filteredUpdates.map((update, idx) => {
                      const sector = SECTORS.find(s => s.name === update.sector);
                      const isLeft = idx % 2 === 0;
                      
                      return (
                        <motion.div 
                          key={update.id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className={cn(
                            "relative flex flex-col md:flex-row items-start md:items-center justify-between",
                            isLeft ? "md:flex-row" : "md:flex-row-reverse"
                          )}
                        >
                           {/* Timeline Node */}
                           <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 w-4 h-4 bg-accent border-4 border-bg-page rounded-full -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block" />

                           {/* Content Card */}
                           <div className={cn(
                             "w-full md:w-[45%] bg-surface border border-border p-10 hover:border-accent transition-all group relative",
                             isLeft ? "md:text-left" : "md:text-right"
                           )}>
                              <div className={cn("flex items-center gap-4 mb-8", isLeft ? "justify-start" : "justify-end")}>
                                 <span className={cn("p-2 border", sector?.border, sector?.bg, sector?.color)}>
                                    {sector && <sector.icon size={16} />}
                                 </span>
                                 <div className={isLeft ? "text-left" : "text-right"}>
                                    <p className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-widest">{update.sector}</p>
                                    <p className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest">
                                       {new Date(update.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                                    </p>
                                 </div>
                              </div>

                              <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-6 leading-none">
                                 {update.title}
                              </h2>

                              <p className="text-text-secondary text-sm leading-relaxed mb-8">
                                 {update.description}
                              </p>

                              {update.sourceUrl && (
                                 <a 
                                   href={update.sourceUrl} target="_blank" rel="noreferrer"
                                   className={cn(
                                     "inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-accent hover:underline",
                                     !isLeft && "flex-row-reverse"
                                   )}
                                 >
                                    VERIFY_SOURCE <ExternalLink size={12} />
                                 </a>
                              )}
                           </div>
                           
                           {/* Year/Month Marker for Desktop */}
                           <div className={cn(
                             "hidden md:flex flex-col w-[45%] items-center",
                             isLeft ? "items-end pr-10" : "items-start pl-10"
                           )}>
                              <span className="text-8xl font-display font-black text-text-primary opacity-5 select-none uppercase tracking-tighter">
                                 {new Date(update.date).toLocaleDateString('en-IN', { month: 'short' })}
                              </span>
                              <span className="text-2xl font-mono font-bold text-text-secondary opacity-10 -mt-8 uppercase">
                                 {new Date(update.date).getFullYear()}
                              </span>
                           </div>
                        </motion.div>
                      );
                   })
                ) : (
                   <div className="flex flex-col items-center justify-center py-40 border border-dashed border-border bg-surface text-center">
                      <div className="w-16 h-16 bg-bg-page border border-border flex items-center justify-center mb-8">
                         <Filter size={24} className="text-text-secondary opacity-30" />
                      </div>
                      <h3 className="text-2xl font-display font-black uppercase tracking-tighter mb-4">No_Growth_Markers_Found</h3>
                      <p className="text-sm font-mono text-text-secondary opacity-50 uppercase tracking-widest">Refine your sector filters or check back later.</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
  );
}
