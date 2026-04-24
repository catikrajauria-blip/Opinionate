import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError } from './firestoreErrorHandler';
import firebaseConfig from '../../firebase-applet-config.json';

const STATS_COL = 'system_stats';
const ENGAGEMENT_DOC = 'engagement';

export const statsService = {
  async incrementSwipes() {
    const statsRef = doc(db, STATS_COL, ENGAGEMENT_DOC);
    console.log(`Incrementing swipes at path: ${statsRef.path} in DB: ${firebaseConfig.firestoreDatabaseId}`);
    let snap;
    
    try {
      snap = await getDoc(statsRef);
    } catch (err: any) {
      handleFirestoreError(err, 'get', `${STATS_COL}/${ENGAGEMENT_DOC}`);
    }

    try {
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
    } catch (err: any) {
      handleFirestoreError(err, snap.exists() ? 'update' : 'create', `${STATS_COL}/${ENGAGEMENT_DOC}`);
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
