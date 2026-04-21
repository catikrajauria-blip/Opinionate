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
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { GoogleGenAI } from "@google/genai";

const NEWSPAPERS_COL = 'newspapers';

export interface Newspaper {
  id: string;
  title: string;
  date: string;
  content: string;
  pdfUrl?: string; // Optional if we just store the content
  createdAt: any;
}

export const newspaperService = {
  async getLatestNewspapers(limitCount = 10) {
    const q = query(
      collection(db, NEWSPAPERS_COL), 
      orderBy('date', 'desc'), 
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Newspaper));
  },

  async getNewspaperById(id: string) {
    const docRef = doc(db, NEWSPAPERS_COL, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Newspaper;
  },

  async getNewspaperByDate(date: string) {
    const q = query(collection(db, NEWSPAPERS_COL), where('date', '==', date), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() } as Newspaper;
  },

  async createNewspaper(data: Omit<Newspaper, 'id' | 'createdAt'>) {
    return await addDoc(collection(db, NEWSPAPERS_COL), {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  async deleteNewspaper(id: string) {
    await deleteDoc(doc(db, NEWSPAPERS_COL, id));
  },

  async extractContentFromPDF(file: File): Promise<string> {
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Using gemini-3-flash-preview as recommended for text extraction tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Data,
            },
          },
          {
            text: "Extract the content of this newspaper PDF and format it into a beautifully structured Markdown article, suitable for high-quality reading on a website. Use headers, bullet points, and sections for different news stories. Ensure clear separation between major headlines. Maintain a professional journalistic tone. Do not include page numbers or footer artifacts.",
          },
        ],
      },
    });

    if (!response.text) {
      throw new Error("Gemini failed to extract content from the PDF.");
    }

    return response.text;
  }
};
