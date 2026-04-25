import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  orderBy, 
  limit,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'words_of_the_day';

export interface WordOfTheDay {
  id?: string;
  word: string;
  definition: string;
  usage?: string;
  date: string;
  createdAt?: any;
}

export const wordService = {
  async addWord(data: Omit<WordOfTheDay, 'id' | 'createdAt'>) {
    return await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  async getLatestWord(): Promise<WordOfTheDay | null> {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, COLLECTION), 
      where('date', '<=', today),
      orderBy('date', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as WordOfTheDay;
  },

  async getAllWords(): Promise<WordOfTheDay[]> {
    const q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WordOfTheDay));
  }
};
