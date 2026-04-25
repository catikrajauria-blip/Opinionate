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
    <div className="pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header Section */}
          <div className="mb-32">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-4 px-5 py-2 bg-accent/5 border border-accent/20 mb-10 glow-cyan/10"
            >
              <Zap size={16} className="text-secondary-accent animate-pulse" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.6em] text-accent">STRATEGIC_POLICY_INDEX_v1.0</span>
            </motion.div>
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16">
              <div className="max-w-4xl">
                <h1 className="text-6xl md:text-9xl font-display font-black tracking-tighter uppercase leading-[0.85] mb-10 text-text-primary">
                  INDIAN_POLICY <br />
                  <span className="text-accent italic drop-shadow-[0_0_15px_rgba(0,238,255,0.3)]">GROWTH_ENGINE</span>
                </h1>
                <p className="text-xl md:text-2xl text-text-secondary leading-relaxed font-medium max-w-3xl border-l-2 border-border pl-8 opacity-70">
                  REAL_TIME_MONITORING: SYSTEMATIC TRACKING OF STATE-LED STRATEGIC INITIATIVES DRIVING THE NATION'S INDUSTRIAL EVOLUTION.
                </p>
              </div>

              <div className="flex flex-wrap gap-6">
                 <div className="bg-surface/50 backdrop-blur-md border border-border p-8 min-w-[240px] relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-40 transition-opacity">
                      <Target size={60} />
                    </div>
                    <div className="text-[11px] font-mono font-bold text-accent uppercase tracking-widest mb-4 opacity-100 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
                      ACTIVE_NODES
                    </div>
                    <p className="text-6xl font-display font-black tracking-tighter text-text-primary">{updates.length}</p>
                 </div>
                 <div className="bg-surface/50 backdrop-blur-md border border-border p-8 min-w-[240px]">
                    <p className="text-[11px] font-mono font-bold text-secondary-accent uppercase tracking-widest mb-4 opacity-60">LAST_INDEX_CMT</p>
                    <p className="text-6xl font-display font-black tracking-tighter text-text-primary">
                      {updates.length > 0 ? new Date(updates[0].date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }).toUpperCase() : '--'}
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {/* Sector Filter Bar */}
          <div className="mb-32 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 border border-border bg-surface/20 backdrop-blur-sm">
             {SECTORS.map((sector) => (
                <button
                  key={sector.name}
                  onClick={() => setActiveSector(activeSector === sector.name ? null : sector.name)}
                  className={cn(
                    "flex flex-col items-start p-10 transition-all relative overflow-hidden group border-border border-r border-b lg:border-b-0 last:border-r-0",
                    activeSector === sector.name ? "bg-accent/5 border-accent" : "hover:bg-surface/50"
                  )}
                >
                   <sector.icon size={32} className={cn("mb-8 transition-all duration-500", sector.color, activeSector === sector.name ? "scale-110 drop-shadow-[0_0_8px_currentColor]" : "opacity-30 grayscale group-hover:opacity-100 group-hover:grayscale-0")} />
                   <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-text-secondary opacity-40 mb-3">MODULE_ID</p>
                   <h3 className="text-2xl font-display font-black uppercase tracking-tighter text-text-primary transition-colors group-hover:text-accent">{sector.name}</h3>
                   
                   {activeSector === sector.name && (
                      <motion.div layoutId="sector-highlight" className="absolute bottom-0 left-0 w-full h-1 bg-accent glow-cyan" />
                   )}
                </button>
             ))}
          </div>

          {/* Timeline View */}
          <div className="relative">
             {/* Vertical Line */}
             <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-accent/40 via-border to-transparent -translate-x-1/2 hidden md:block" />

             <div className="space-y-40">
                {loading ? (
                   Array(3).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center justify-center p-24 border border-dashed border-border bg-surface/10">
                         <div className="text-[11px] font-mono font-bold text-accent uppercase tracking-[0.6em] animate-pulse">INITIATING_TIMELINE_SEQUENCER...</div>
                      </div>
                   ))
                ) : filteredUpdates.length > 0 ? (
                   filteredUpdates.map((update, idx) => {
                      const sector = SECTORS.find(s => s.name === update.sector);
                      const isLeft = idx % 2 === 0;
                      
                      return (
                        <motion.div 
                          key={update.id}
                          initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: "-100px" }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className={cn(
                            "relative flex flex-col md:flex-row items-start md:items-center justify-between",
                            isLeft ? "md:flex-row" : "md:flex-row-reverse"
                          )}
                        >
                           {/* Timeline Node */}
                           <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 w-4 h-4 bg-accent border-4 border-bg-page rounded-full -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block glow-cyan" />

                           {/* Content Card */}
                           <div className={cn(
                             "w-full md:w-[46%] bg-surface/40 backdrop-blur-md border border-border p-12 hover:border-accent/30 transition-all group relative overflow-hidden",
                             isLeft ? "md:text-left" : "md:text-right"
                           )}>
                              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className={cn("flex items-center gap-6 mb-10", isLeft ? "justify-start" : "justify-end")}>
                                 <span className={cn("p-3 border transition-colors group-hover:scale-110 duration-500", sector?.border, sector?.bg, sector?.color)}>
                                    {sector && <sector.icon size={20} />}
                                 </span>
                                 <div className={isLeft ? "text-left" : "text-right"}>
                                    <p className="text-[10px] font-mono font-bold text-accent uppercase tracking-[0.4em] mb-1">{update.sector}</p>
                                    <p className="text-[11px] font-mono font-bold text-text-primary uppercase tracking-widest opacity-80">
                                       {new Date(update.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                                    </p>
                                 </div>
                              </div>

                              <h2 className="text-3xl font-display font-black uppercase tracking-tighter mb-8 leading-[1] text-text-primary group-hover:text-accent transition-colors">
                                 {update.title}
                              </h2>

                              <p className="text-text-secondary text-base leading-relaxed mb-10 opacity-70 font-sans font-medium">
                                 "{update.description}"
                              </p>

                              {update.sourceUrl && (
                                 <a 
                                   href={update.sourceUrl} target="_blank" rel="noreferrer"
                                   className={cn(
                                     "inline-flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-accent hover:text-text-primary transition-all group/link",
                                     !isLeft && "flex-row-reverse"
                                   )}
                                 >
                                    UPLINK_SOURCE <ExternalLink size={14} className="group-hover/link:rotate-45 transition-transform" />
                                 </a>
                              )}
                           </div>
                           
                           {/* Year/Month Marker for Desktop */}
                           <div className={cn(
                             "hidden md:flex flex-col w-[46%] items-center",
                             isLeft ? "items-end pr-16" : "items-start pl-16"
                           )}>
                              <span className="text-[12rem] font-display font-black text-text-primary opacity-[0.02] select-none uppercase tracking-tighter leading-none group-hover:opacity-[0.05] transition-opacity">
                                 {new Date(update.date).toLocaleDateString('en-IN', { month: 'short' })}
                              </span>
                              <span className="text-4xl font-mono font-bold text-accent opacity-10 -mt-16 uppercase tracking-[0.3em] group-hover:opacity-30 transition-opacity">
                                 {new Date(update.date).getFullYear()}
                              </span>
                           </div>
                        </motion.div>
                      );
                   })
                ) : (
                   <div className="flex flex-col items-center justify-center py-48 border border-dashed border-border bg-surface flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-surface border border-border flex items-center justify-center mb-10 group rounded-full">
                         <Filter size={32} className="text-accent opacity-20 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="text-4xl font-display font-black uppercase tracking-tighter mb-6 text-text-primary">NODES_NOT_FOUND</h3>
                      <p className="text-[11px] font-mono text-text-secondary opacity-50 uppercase tracking-[0.4em] max-w-sm">REFINE TEMPORAL_FILTERS OR SECTOR_QUERIES TO RE-INDEX THE DATABASE.</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
  );
}
