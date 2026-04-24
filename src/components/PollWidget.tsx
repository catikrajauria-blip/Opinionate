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
      className="bg-accent/5 border-y md:border-x md:border-t-0 border-border/60 py-10 px-8 md:px-12 relative overflow-hidden"
    >
      {/* Background Decorative Pattern */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <BarChart3 size={120} className="text-accent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-4">
             <span className="w-8 h-[2px] bg-accent"></span>
             <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent">YOUR_OPINION_MATTERS</p>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tighter leading-tight">
            {poll.question}
          </h2>
        </div>

        <div className="w-full md:w-auto min-w-[320px]">
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              {!showResults ? (
                <motion.div 
                  key="vote-options"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {poll.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleVote(option)}
                      disabled={voting}
                      className="group w-full flex items-center justify-between p-4 bg-bg-page border border-border/60 hover:border-accent transition-all text-left"
                    >
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-text-secondary group-hover:text-text-primary transition-colors">
                        {option}
                      </span>
                      <ChevronRight size={14} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                    </button>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="vote-results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3 bg-bg-page p-6 border border-border/60"
                >
                   <div className="flex items-center gap-2 mb-4 text-green-500">
                      <CheckCircle2 size={16} />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">REACTION_INTEL_GATHERED</span>
                   </div>
                   
                   {poll.options.map((option, idx) => {
                     const votes = poll.results[option] || 0;
                     const percentage = poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0;
                     return (
                       <div key={idx} className="space-y-2">
                         <div className="flex justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-text-secondary">
                           <span>{option}</span>
                           <span>{percentage}%</span>
                         </div>
                         <div className="h-1 bg-surface relative overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="absolute top-0 left-0 h-full bg-accent"
                            />
                         </div>
                       </div>
                     );
                   })}
                   
                   <p className="text-[8px] font-mono text-text-secondary opacity-50 uppercase tracking-widest mt-6 pt-4 border-t border-border/20">
                     TOTAL_METRICS: {poll.totalVotes}_VOTES_ANALYSED
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
