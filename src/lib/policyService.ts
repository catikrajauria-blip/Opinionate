import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  orderBy, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'policy_updates';

export interface PolicyUpdate {
  id?: string;
  sector: 'Manufacturing' | 'Infrastructure' | 'Defence' | 'Tech' | 'Economy';
  title: string;
  description: string;
  date: string;
  sourceUrl?: string;
  createdAt?: any;
}

export const policyService = {
  async addUpdate(data: Omit<PolicyUpdate, 'id' | 'createdAt'>) {
    // Remove undefined fields to prevent Firestore errors
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key as keyof typeof data] = value;
      }
      return acc;
    }, {} as any);

    return await addDoc(collection(db, COLLECTION), {
      ...cleanData,
      createdAt: serverTimestamp()
    });
  },

  async getAllUpdates(): Promise<PolicyUpdate[]> {
    const q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PolicyUpdate));
  },

  async getUpdatesBySector(sector: string): Promise<PolicyUpdate[]> {
    const q = query(
      collection(db, COLLECTION), 
      where('sector', '==', sector),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PolicyUpdate));
  },

  async deleteUpdate(id: string) {
    await deleteDoc(doc(db, COLLECTION, id));
  }
};
