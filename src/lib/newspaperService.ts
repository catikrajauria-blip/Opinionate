import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  deleteDoc,
  where,
  getDocFromServer
} from 'firebase/firestore';
import { db } from './firebase';
import { supabase } from './supabase';
import { GoogleGenAI } from "@google/genai";

const NEWSPAPERS_COL = 'newspapers';

export interface Newspaper {
  id: string;
  title: string;
  date: string;
  content: string;
  pdfUrl?: string;
  createdAt?: any;
}

export const newspaperService = {
  /**
   * Uploads a PDF to Supabase Storage.
   */
  async uploadNewspaperPDF(file: File, bucket: string = 'newspapers'): Promise<string> {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase Upload Error:", error);
      throw new Error(`PDF Upload Failed: ${error.message}`);
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('newspapers')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  /**
   * Tests the connection to Firestore. Throws if disabled or uninitialized.
   */
  async validateConnection() {
    try {
      // Try to fetch a non-existent doc from server to trigger connectivity check
      const testRef = doc(db, NEWSPAPERS_COL, 'connection-test-ping');
      await getDocFromServer(testRef);
    } catch (error: any) {
      // If it's a "not found" error, it actually means we ARE connected (since we reached the server)
      if (error.code === 'not-found') return;
      
      console.error("Firestore connectivity check failed:", error);
      throw new Error(`Cloud connection unstable. Please ensure your Firebase database is created and active. (${error.message})`);
    }
  },

  async getLatestNewspapers(limitCount = 10): Promise<Newspaper[]> {
    const q = query(
      collection(db, NEWSPAPERS_COL),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Newspaper[];
  },

  async getNewspaperById(id: string): Promise<Newspaper | null> {
    const docRef = doc(db, NEWSPAPERS_COL, id);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) return null;
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Newspaper;
  },

  async getNewspaperByDate(date: string): Promise<Newspaper | null> {
    const q = query(
      collection(db, NEWSPAPERS_COL),
      where('date', '==', date),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Newspaper;
  },

  async createNewspaper(data: {
    title: string;
    date: string;
    content: string;
    pdfUrl?: string;
  }) {
    return await addDoc(collection(db, NEWSPAPERS_COL), {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  async deleteNewspaper(id: string, _pdfUrl?: string) {
    await deleteDoc(doc(db, NEWSPAPERS_COL, id));
  }
};
