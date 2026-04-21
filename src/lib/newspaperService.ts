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
import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable, UploadTaskSnapshot } from 'firebase/storage';
import { db, storage } from './firebase';
import { GoogleGenAI } from "@google/genai";

const NEWSPAPERS_COL = 'newspapers';

export interface Newspaper {
  id: string;
  title: string;
  date: string;
  content: string;
  pdfUrl?: string; // Optional if we just store the content
  isExternalPdf?: boolean; // Flag to indicate PDF is hosted outside of Firebase
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
      isExternalPdf: data.pdfUrl ? (!data.pdfUrl.includes('firebasestorage.googleapis.com') && !data.pdfUrl.includes('firebasestorage.app')) : false,
      createdAt: serverTimestamp()
    });
  },

  async uploadNewspaperPDF(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const storageRef = ref(storage, `newspapers/${Date.now()}_${file.name}`);
    console.log(`Starting upload to: ${storageRef.fullPath}`);
    
    if (onProgress) {
      return new Promise((resolve, reject) => {
        try {
          const uploadTask = uploadBytesResumable(storageRef, file);
          
          uploadTask.on('state_changed', 
            (snapshot: UploadTaskSnapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload progress: ${progress.toFixed(2)}%`);
              onProgress(progress);
            }, 
            (error) => {
              console.error("Firebase Storage Upload Error:", error);
              reject(error);
            }, 
            async () => {
              console.log("Upload complete, getting download URL...");
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        } catch (err) {
          console.error("Failed to initialize upload task:", err);
          reject(err);
        }
      });
    } else {
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    }
  },

  async deleteNewspaper(id: string, pdfUrl?: string) {
    await deleteDoc(doc(db, NEWSPAPERS_COL, id));
    if (pdfUrl) {
      try {
        const fileRef = ref(storage, pdfUrl);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('Could not delete PDF file from storage:', err);
      }
    }
  },

  async extractContentFromPDF(file: File): Promise<string> {
    // Gemini API has a 20MB limit for inlineData. 
    // We skip for files > 15MB to be safe and avoid browser memory issues with base64 strings.
    if (file.size > 15 * 1024 * 1024) {
      console.warn('PDF too large for AI synthesis (>15MB). Skipping transcription.');
      return "Transcription omitted due to large file size (15MB+). The original document is available for direct reading.";
    }

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          if (!result) return reject(new Error("Failed to read file"));
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error("File reading error"));
        reader.readAsDataURL(file);
      });

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Data,
          },
        },
        "Extract the content of this newspaper PDF and format it into a beautifully structured Markdown article. Use headers and sections. If the PDF is mostly images or layout-heavy, provide a high-level summary of the main stories. Maintain professional tone.",
      ]);
      
      const text = result.response.text();
      return text || "Synthesis was unable to extract text content, but the original PDF is available for reading.";
    } catch (error) {
      console.error('AI Extraction failed:', error);
      return "Transcription service is currently unavailable. Please view the original PDF edition.";
    }
  }
};
