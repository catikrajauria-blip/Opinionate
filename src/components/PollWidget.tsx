import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, ChevronRight, CheckCircle2 } from 'lucide-react';
import { pollService } from '../lib/pollService';
import { Poll } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { generateUserId } from '../lib/utils';

export default function PollWidget() {
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [userId] = useState(() => user?.uid || generateUserId());

  useEffect(() => {
    async function loadPoll() {
      try {
        const latestPoll = await pollService.getLatestPoll();
        if (latestPoll) {
          setPoll(latestPoll);
          const hasVotedStatus = await pollService.hasVoted(latestPoll.id, userId);
          setVoted(hasVotedStatus);
        }
      } catch (err) {
        console.error('Error loading poll:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPoll();
  }, [userId]);

  const handleVote = async (option: string) => {
    if (!poll || voting || voted) return;
    setVoting(true);
    try {
      await pollService.vote(poll.id, userId, option);
      setVoted(true);
      // Refresh poll data to show updated results
      const updatedPoll = await pollService.getLatestPoll();
      if (updatedPoll) setPoll(updatedPoll);
    } catch (err) {
      console.error('Error voting:', err);
      alert('Failed to cast vote. ' + (err instanceof Error ? err.message : ''));
    } finally {
      setVoting(false);
    }
  };

  if (loading || !poll) return null;

  const showResults = voted || poll.showResults;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-accent/5 border-y md:border-x md:border-t-0 border-accent/20 py-16 px-8 md:px-16 relative overflow-hidden group"
    >
      {/* Background Decorative Pattern */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-accent/10 -translate-y-1/2" />
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
        <BarChart3 size={200} className="text-secondary-accent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
        <div className="max-w-xl">
          <div className="flex items-center gap-4 mb-6">
             <div className="w-10 h-[2px] bg-accent glow-cyan"></div>
             <p className="text-[11px] font-mono font-bold uppercase tracking-[0.5em] text-accent animate-pulse">COMMUNITY POLL</p>
          </div>
                      <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter leading-[0.95] text-text-primary mb-6">
                        {poll.question}
                      </h2>
        </div>

        <div className="w-full md:w-auto min-w-[340px]">
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {!showResults ? (
                <motion.div 
                  key="vote-options"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-3"
                >
                  {poll.options.map((option, idx) => (
                    <button
                      key={option}
                      onClick={() => handleVote(option)}
                      disabled={voting}
                      className="group w-full flex items-center justify-between p-5 bg-surface/50 backdrop-blur-md border border-accent/10 hover:border-accent hover:glow-cyan transition-all text-left relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors" />
                      <span className="text-sm font-mono font-bold uppercase tracking-widest text-text-secondary group-hover:text-accent transition-colors relative z-10 flex items-center gap-3">
                        <span className="opacity-30">0{idx + 1}</span>
                        {option}
                      </span>
                      <ChevronRight size={16} className="text-accent opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0 relative z-10" />
                    </button>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="vote-results"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5 bg-surface/80 backdrop-blur-xl p-8 border border-accent/30 glow-pink"
                >
                   <div className="flex items-center gap-3 mb-6 text-accent">
                      <CheckCircle2 size={18} className="animate-pulse" />
                      <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] drop-shadow-[0_0_5px_rgba(0,238,255,0.4)]">VOTE RECORDED</span>
                   </div>
                   
                   {poll.options.map((option) => {
                     const votes = poll.results[option] || 0;
                     const percentage = poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0;
                     return (
                       <div key={option} className="space-y-3">
                         <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">
                           <span className="flex items-center gap-2">
                             <div className="w-1 h-1 bg-accent rounded-full" />
                             {option}
                           </span>
                           <span className="text-accent">{percentage}%</span>
                         </div>
                         <div className="h-1.5 bg-bg-page/50 relative rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-secondary-accent glow-cyan"
                            />
                         </div>
                       </div>
                     );
                   })}
                   
                   <p className="text-[9px] font-mono text-text-secondary uppercase tracking-[0.4em] mt-8 pt-6 border-t border-border flex justify-between items-center">
                     <span>POLL STATS</span>
                     <span className="text-accent">{poll.totalVotes} TOTAL VOTES</span>
                   </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
