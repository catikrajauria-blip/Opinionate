import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  increment, 
  Timestamp,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { Blog, Comment, Subscriber, ContactMessage, Rating, Like, View } from '../types';

const BLOGS_COL = 'blogs';
const COMMENTS_COL = 'comments';
const SUBSCRIBERS_COL = 'subscribers';
const MESSAGES_COL = 'messages';
const RATINGS_COL = 'ratings';
const LIKES_COL = 'likes';
const VIEWS_COL = 'views';

export const blogService = {
  // Blog operations
  async getLatestBlogs(limitCount = 10) {
    const q = query(collection(db, BLOGS_COL), orderBy('date', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
  },

  async getBlogBySlug(slug: string) {
    const q = query(collection(db, BLOGS_COL), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const blogDoc = snapshot.docs[0];
    return { id: blogDoc.id, ...blogDoc.data() } as Blog;
  },

  async getTodayBlog() {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, BLOGS_COL), where('date', '==', today), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const blogDoc = snapshot.docs[0];
    return { id: blogDoc.id, ...blogDoc.data() } as Blog;
  },

  async createBlog(blog: Omit<Blog, 'id' | 'likesCount' | 'viewsCount' | 'ratingAverage' | 'ratingCount' | 'createdAt'>) {
    const newBlog = {
      ...blog,
      likesCount: 0,
      viewsCount: 0,
      ratingAverage: 0,
      ratingCount: 0,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, BLOGS_COL), newBlog);
    return docRef.id;
  },

  async incrementViews(blogId: string, userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const viewId = `${blogId}_${userId}_${today}`;
    const viewRef = doc(db, VIEWS_COL, viewId);
    
    const viewSnap = await getDoc(viewRef);
    if (!viewSnap.exists()) {
      await setDoc(viewRef, { blogId, userId, date: today });
      await updateDoc(doc(db, BLOGS_COL, blogId), {
        viewsCount: increment(1)
      });
      return true;
    }
    return false;
  },

  async incrementLikes(blogId: string, userId: string) {
    const likeId = `${blogId}_${userId}`;
    const likeRef = doc(db, LIKES_COL, likeId);
    
    const likeSnap = await getDoc(likeRef);
    if (!likeSnap.exists()) {
      await setDoc(likeRef, { blogId, userId });
      await updateDoc(doc(db, BLOGS_COL, blogId), {
        likesCount: increment(1)
      });
      return true;
    }
    return false;
  },

  async addRating(blogId: string, userId: string, score: number) {
    const ratingId = `${blogId}_${userId}`;
    const ratingRef = doc(db, RATINGS_COL, ratingId);
    const blogRef = doc(db, BLOGS_COL, blogId);

    const ratingSnap = await getDoc(ratingRef);
    if (ratingSnap.exists()) {
       throw new Error('You already rated this blog');
    }

    await runTransaction(db, async (transaction) => {
      const blogSnap = await transaction.get(blogRef);
      if (!blogSnap.exists()) throw new Error('Blog not found');
      
      const blogData = blogSnap.data() as Blog;
      const newRatingCount = blogData.ratingCount + 1;
      const newAverage = ((blogData.ratingAverage * blogData.ratingCount) + score) / newRatingCount;
      
      transaction.set(ratingRef, { blogId, userId, score, createdAt: serverTimestamp() });
      transaction.update(blogRef, {
        ratingAverage: newAverage,
        ratingCount: newRatingCount
      });
    });
  },

  // Comment operations
  async getComments(blogId: string) {
    const q = query(collection(db, BLOGS_COL, blogId, COMMENTS_COL), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
  },

  async addComment(blogId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'isModerated'>) {
    const newComment = {
      ...comment,
      createdAt: serverTimestamp(),
      isModerated: false
    };
    return await addDoc(collection(db, BLOGS_COL, blogId, COMMENTS_COL), newComment);
  },

  // Newsletter operations
  async subscribe(email: string) {
    const subRef = doc(db, SUBSCRIBERS_COL, email);
    const subSnap = await getDoc(subRef);
    if (subSnap.exists() && subSnap.data()?.status === 'active') {
      throw new Error('Already subscribed');
    }
    await setDoc(subRef, {
      email,
      subscribedAt: serverTimestamp(),
      status: 'active'
    });
  },

  // Admin operations
  async getSubscribers() {
    const q = query(collection(db, SUBSCRIBERS_COL), where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ email: doc.id, ...doc.data() } as Subscriber));
  },

  async getAllBlogs() {
    const q = query(collection(db, BLOGS_COL), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
  },

  async deleteBlog(blogId: string) {
    // Note: In a real app, you'd also delete comments, but rules handle subcollections
    // For simplicity, we just delete the blog document.
    await updateDoc(doc(db, BLOGS_COL, blogId), { deletedAt: serverTimestamp() });
    // In many designs, we use a soft delete
  },

  // Contact operations
  async sendMessage(message: Omit<ContactMessage, 'id' | 'createdAt'>) {
    return await addDoc(collection(db, MESSAGES_COL), {
      ...message,
      createdAt: serverTimestamp()
    });
  }
};
