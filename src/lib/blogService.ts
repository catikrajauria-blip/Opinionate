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
  runTransaction,
  deleteDoc,
  collectionGroup,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Blog, Comment, Subscriber, ContactMessage, Rating, Like, View, UserProfile } from '../types';

const handleFirestoreError = (error: any, operationType: string, path: string | null = null) => {
  if (error?.code === 'permission-denied') {
    const user = auth.currentUser;
    const errorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: user?.uid || 'anonymous',
        email: user?.email || 'none',
        emailVerified: user?.emailVerified || false,
        isAnonymous: user?.isAnonymous || true,
        providerInfo: user?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
};

const BLOGS_COL = 'blogs';
const COMMENTS_COL = 'comments';
const SUBSCRIBERS_COL = 'subscribers';
const MESSAGES_COL = 'messages';
const RATINGS_COL = 'ratings';
const LIKES_COL = 'likes';
const VIEWS_COL = 'views';
const NEWS_COL = 'news';

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

  async getTodayBlogs() {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, BLOGS_COL), where('date', '==', today), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
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

    try {
      const ratingSnap = await getDoc(ratingRef);
      if (ratingSnap.exists()) {
         throw new Error('You already rated this blog');
      }

      await runTransaction(db, async (transaction) => {
        const blogSnap = await transaction.get(blogRef);
        if (!blogSnap.exists()) throw new Error('Blog not found');
        
        const blogData = blogSnap.data() as Blog;
        const currentCount = blogData.ratingCount || 0;
        const currentAverage = blogData.ratingAverage || 0;
        
        const newRatingCount = currentCount + 1;
        const newAverage = ((currentAverage * currentCount) + score) / newRatingCount;
        
        transaction.set(ratingRef, { blogId, userId, score, createdAt: serverTimestamp() });
        transaction.update(blogRef, {
          ratingAverage: newAverage,
          ratingCount: newRatingCount
        });
      });
    } catch (error) {
      handleFirestoreError(error, 'write', `blogs/${blogId}/ratings`);
    }
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

  async deleteSubscriber(email: string) {
    await deleteDoc(doc(db, SUBSCRIBERS_COL, email));
  },

  async getAdminStats() {
    const blogs = await this.getAllBlogs();
    const subs = await this.getSubscribers();
    
    const totalViews = blogs.reduce((acc, b) => acc + (b.viewsCount || 0), 0);
    const totalLikes = blogs.reduce((acc, b) => acc + (b.likesCount || 0), 0);
    const avgRating = blogs.length > 0 
      ? blogs.reduce((acc, b) => acc + (b.ratingAverage || 0), 0) / blogs.length 
      : 0;

    return {
      totalBlogs: blogs.length,
      totalSubscribers: subs.length,
      totalViews,
      totalLikes,
      avgRating
    };
  },

  async getAllBlogs() {
    const q = query(collection(db, BLOGS_COL), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
  },

  async deleteBlog(blogId: string) {
    await deleteDoc(doc(db, BLOGS_COL, blogId));
  },

  // Contact operations
  async sendMessage(message: Omit<ContactMessage, 'id' | 'createdAt'>) {
    return await addDoc(collection(db, MESSAGES_COL), {
      ...message,
      createdAt: serverTimestamp()
    });
  },

  // News operations
  async getNewsByCategory(category: string, limitCount = 10) {
    const q = query(
      collection(db, NEWS_COL), 
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addNews(newsItem: any) {
    return await addDoc(collection(db, NEWS_COL), {
      ...newsItem,
      createdAt: serverTimestamp()
    });
  },

  async deleteNews(newsId: string) {
    await deleteDoc(doc(db, NEWS_COL, newsId));
  },

  async toggleSaveBlog(uid: string, blogId: string) {
    const saveRef = doc(db, 'users', uid, 'saved_blogs', blogId);
    const saveSnap = await getDoc(saveRef);
    if (saveSnap.exists()) {
      await deleteDoc(saveRef);
      return false; // un-saved
    } else {
      await setDoc(saveRef, { blogId, savedAt: serverTimestamp() });
      return true; // saved
    }
  },

  async getSavedBlogIds(uid: string) {
    const snap = await getDocs(collection(db, 'users', uid, 'saved_blogs'));
    return snap.docs.map(doc => doc.id);
  },

  async getSavedBlogs(uid: string) {
    const ids = await this.getSavedBlogIds(uid);
    if (ids.length === 0) return [];
    
    // Firestore 'in' query limit is 10 (or 30 now, but better handle chunks if many)
    const blogPromises = ids.map(id => getDoc(doc(db, BLOGS_COL, id)));
    const snaps = await Promise.all(blogPromises);
    return snaps.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() } as Blog));
  },

  // User management
  async getAllUsers() {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProfile);
  },

  async updateUserStatus(uid: string, isBlocked: boolean) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { isBlocked });
  },

  async updateUserRole(uid: string, role: 'admin' | 'user') {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });
  },

  async getNewsCounts() {
    const snap = await getDocs(collection(db, NEWS_COL));
    const counts: Record<string, number> = {
      finance: 0,
      politics: 0,
      geopolitics: 0,
      tech: 0
    };
    snap.forEach(doc => {
      const cat = doc.data().category;
      if (counts[cat] !== undefined) counts[cat]++;
    });
    return counts;
  },

  async getGlobalRecentComments(limitCount = 5) {
    try {
      const q = query(
        collectionGroup(db, COMMENTS_COL),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      const results = await Promise.all(snapshot.docs.map(async (commentDoc) => {
        const data = commentDoc.data();
        const blogId = data.blogId;
        const blogRef = doc(db, BLOGS_COL, blogId);
        const blogSnap = await getDoc(blogRef);
        const blogData = blogSnap.data();
        
        return {
          id: commentDoc.id,
          ...data,
          blogSlug: blogData?.slug || '',
          blogTitle: blogData?.title || 'Unknown Blog'
        } as any;
      }));
      return results;
    } catch (err: any) {
      console.warn('CollectionGroup query failed (possibly missing index). Falling back to multi-blog fetch.', err);
      
      // Fallback: Fetch latest blogs and their comments
      // This is less efficient but works without manual indexing
      const blogsSnapshot = await getDocs(query(collection(db, BLOGS_COL), orderBy('date', 'desc'), limit(10)));
      const allComments: any[] = [];
      
      await Promise.all(blogsSnapshot.docs.map(async (blogDoc) => {
        const commentsSnap = await getDocs(query(collection(db, BLOGS_COL, blogDoc.id, COMMENTS_COL), orderBy('createdAt', 'desc'), limit(3)));
        commentsSnap.forEach(cDoc => {
          allComments.push({
            id: cDoc.id,
            ...cDoc.data(),
            blogSlug: blogDoc.data().slug,
            blogTitle: blogDoc.data().title
          });
        });
      }));
      
      // Sort and take top few
      return allComments
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        .slice(0, limitCount);
    }
  }
};
