import React, { useEffect, useState } from 'react';
import NewsletterBox from './NewsletterBox';
import { blogService } from '../lib/blogService';
import { Link } from 'react-router-dom';
import { MessageSquare, Loader2 } from 'lucide-react';

export default function Sidebar() {
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const comments = await blogService.getGlobalRecentComments(3);
        setRecentComments(comments);
      } catch (err) {
        console.error('Error fetching sidebar comments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, []);

  return (
    <aside className="flex flex-col border-t lg:border-t-0 lg:border-l border-border min-h-fit lg:min-h-screen divide-y divide-border">
      <div className="p-10">
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent mb-10">
          LATEST INTRA-ACTIONS
        </h4>
        <div className="space-y-10">
          {loading ? (
             <div className="flex items-center gap-3 text-text-secondary text-[10px] font-mono font-bold uppercase tracking-widest">
                <Loader2 size={14} className="animate-spin text-accent" />
                SYSTEM_SYNCING...
             </div>
          ) : recentComments.length > 0 ? (
            recentComments.map((comment) => (
              <Link 
                key={comment.id} 
                to={`/blog/${comment.blogSlug}`}
                className="block group"
              >
                <div className="group-hover:translate-x-1 transition-transform">
                   <p className="text-[9px] font-mono font-bold text-accent mb-2 uppercase tracking-tight flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                     {comment.name}
                   </p>
                   <p className="text-sm font-display font-bold leading-tight mb-2 group-hover:text-accent transition-colors">
                     "{comment.content}"
                   </p>
                   <p className="text-[8px] font-mono font-bold text-text-secondary uppercase tracking-[0.2em] opacity-50">
                     TARGET: {comment.blogTitle}
                   </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-text-secondary font-mono text-[10px] uppercase tracking-widest italic opacity-50">NULL_COMMENTS</p>
          )}
        </div>
      </div>
      
      <div className="p-10 bg-surface">
         <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent mb-6">
           SYSTEM_CONNECT
         </h4>
         <NewsletterBox />
      </div>
    </aside>
  );
}
