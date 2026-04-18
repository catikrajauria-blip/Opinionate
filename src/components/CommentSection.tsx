import React, { useState, useEffect } from 'react';
import { blogService } from '../lib/blogService';
import { Comment } from '../types';
import { MessageSquare, Send, User, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

interface CommentSectionProps {
  blogId: string;
}

export default function CommentSection({ blogId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    async function loadComments() {
      try {
        const fetched = await blogService.getComments(blogId);
        // Organize comments into a tree if needed, or simple flat list for now
        setComments(fetched);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [blogId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const resp = await blogService.addComment(blogId, {
        blogId,
        parentId: replyTo,
        name,
        content
      });
      
      const newComment: Comment = {
        id: resp.id,
        blogId,
        parentId: replyTo,
        name,
        content,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any, // Temporary for UI
        isModerated: false
      };

      setComments([newComment, ...comments]);
      setName('');
      setContent('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getParentComments = () => comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  return (
    <section className="mt-16 pt-16 border-t border-gray-100">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
          <MessageSquare size={20} />
        </div>
        <h2 className="text-2xl font-display font-bold">Comments ({comments.length})</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-12 bg-surface rounded-3xl p-6 md:p-8 border border-border shadow-sm">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-text-primary">
           {replyTo ? `Replying to ${comments.find(c => c.id === replyTo)?.name}` : 'Share your thoughts'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-text-secondary ml-1">Your Name</label>
            <input 
              type="text" 
              required
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-bg-page border border-border rounded-xl focus:ring-2 focus:ring-text-primary transition-all text-sm outline-none text-text-primary placeholder:text-text-secondary/50"
            />
          </div>
          {replyTo && (
            <div className="flex items-end pb-1 px-4">
               <button 
                 type="button" 
                 onClick={() => setReplyTo(null)}
                 className="text-xs text-red-500 font-bold hover:underline"
               >
                 Cancel Reply
               </button>
            </div>
          )}
        </div>
        <div className="space-y-1.5 mb-6">
          <label className="text-[11px] font-bold uppercase tracking-widest text-text-secondary ml-1">Your Comment</label>
          <textarea 
            required
            rows={4}
            placeholder="Write something thoughtful..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 bg-bg-page border border-border rounded-xl focus:ring-2 focus:ring-text-primary transition-all text-sm outline-none resize-none text-text-primary placeholder:text-text-secondary/50"
          />
        </div>
        <button 
          disabled={isSubmitting}
          className="w-full md:w-auto px-8 py-3.5 bg-text-primary text-bg-page rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
          <Send size={16} />
        </button>
      </form>

      <div className="space-y-8">
        <AnimatePresence initial={false}>
          {getParentComments().map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onReply={setReplyTo} 
              replies={getReplies(comment.id)}
            />
          ))}
        </AnimatePresence>
        
        {!loading && comments.length === 0 && (
          <div className="text-center py-10 text-gray-400 font-medium">
            No comments yet. Be the first to start the conversation!
          </div>
        )}
      </div>
    </section>
  );
}

function CommentItem({ comment, onReply, replies }: { comment: Comment, onReply: (id: string) => void, replies: Comment[] }) {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="group"
    >
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-text-secondary flex-shrink-0 border border-border">
          <User size={24} />
        </div>
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-bold text-text-primary">{comment.name}</span>
            <span className="text-xs text-text-secondary">
               {comment.createdAt ? formatDistanceToNow(comment.createdAt.toMillis ? comment.createdAt.toMillis() : comment.createdAt.seconds * 1000) : 'Just now'} ago
            </span>
          </div>
          <p className="text-text-secondary leading-relaxed mb-3 text-sm">
            {comment.content}
          </p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onReply(comment.id)}
              className="text-xs font-bold text-text-primary hover:opacity-80 transition-colors bg-surface px-3 py-1.5 rounded-lg border border-border"
            >
              Reply
            </button>
            {replies.length > 0 && (
               <button 
                 onClick={() => setShowReplies(!showReplies)}
                 className="text-xs font-bold text-text-secondary flex items-center gap-1 hover:text-text-primary"
               >
                 {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                 {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
               </button>
            )}
          </div>
        </div>
      </div>

      {showReplies && replies.length > 0 && (
        <div className="ml-16 mt-6 space-y-6 border-l-2 border-gray-50 pl-6">
          {replies.map(reply => (
             <CommentItem key={reply.id} comment={reply} onReply={onReply} replies={[]} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
