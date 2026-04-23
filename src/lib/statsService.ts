import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

const STATS_COL = 'system_stats';
const ENGAGEMENT_DOC = 'engagement';

export const statsService = {
  async incrementSwipes() {
    const statsRef = doc(db, STATS_COL, ENGAGEMENT_DOC);
    try {
      const snap = await getDoc(statsRef);
      if (!snap.exists()) {
        await setDoc(statsRef, {
          swipesCount: 1,
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(statsRef, {
          swipesCount: increment(1),
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Error incrementing swipes:', err);
    }
  },

  async getSystemStats() {
    const statsRef = doc(db, STATS_COL, ENGAGEMENT_DOC);
    const snap = await getDoc(statsRef);
    if (!snap.exists()) {
      return { swipesCount: 0 };
    }
    return snap.data() as { swipesCount: number; updatedAt: any };
  }
};
