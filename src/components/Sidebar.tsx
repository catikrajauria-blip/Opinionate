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
    <aside className="hidden lg:flex flex-col gap-10 bg-surface p-10 border-l border-border min-h-screen">
      <div className="sidebar-section">
        <h4 className="text-[12px] uppercase tracking-widest text-text-secondary font-bold mb-6">
          Recent Comments
        </h4>
        <div className="space-y-6">
          {loading ? (
             <div className="flex items-center gap-2 text-text-secondary text-xs italic">
                <Loader2 size={14} className="animate-spin" />
                Loading community voices...
             </div>
          ) : recentComments.length > 0 ? (
            recentComments.map((comment) => (
              <Link 
                key={comment.id} 
                to={`/blog/${comment.blogSlug}`}
                className="block group"
              >
                <div className="text-[13px] border-l-2 border-border pl-3 group-hover:border-text-primary transition-colors">
                   <p className="font-bold text-text-primary mb-1 flex items-center gap-2">
                     <MessageSquare size={10} className="text-text-secondary" />
                     {comment.name}
                   </p>
                   <p className="text-text-secondary leading-normal italic line-clamp-2 mb-1">
                     "{comment.content}"
                   </p>
                   <p className="text-[10px] text-text-primary uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                     On: {comment.blogTitle}
                   </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-text-secondary italic text-xs">No comments yet. Be the first to start the conversation.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
