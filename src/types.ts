import { Timestamp } from 'firebase/firestore';

export interface Blog {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  content: string;
  author: string;
  image?: string;
  slug: string;
  likesCount: number;
  viewsCount: number;
  ratingAverage: number;
  ratingCount: number;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  blogId: string;
  parentId: string | null;
  name: string;
  content: string;
  createdAt: Timestamp;
  isModerated: boolean;
  replies?: Comment[];
}

export interface Subscriber {
  email: string;
  subscribedAt: Timestamp;
  status: 'active' | 'unsubscribed';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Timestamp;
}

export interface Rating {
  userId: string;
  blogId: string;
  score: number;
  createdAt: Timestamp;
}

export interface View {
  blogId: string;
  userId: string; // localStorage-based unique ID
  date: string; // YYYY-MM-DD
}

export interface Like {
  blogId: string;
  userId: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'user';
  isBlocked: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface SavedBlog {
  blogId: string;
  savedAt: Timestamp;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  results: Record<string, number>;
  status: 'active' | 'archived';
  showResults: boolean;
  totalVotes: number;
  createdAt: Timestamp;
}

export interface PollResponse {
  pollId: string;
  userId: string;
  option: string;
  createdAt: Timestamp;
}

export interface Newspaper {
  id: string;
  title: string;
  date: string;
  content: string;
  pdfUrl?: string;
  createdAt: Timestamp;
}
