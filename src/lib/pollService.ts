import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { Poll, PollResponse } from '../types';

const POLLS_COL = 'polls';
const RESPONSES_COL = 'poll_responses';

export const pollService = {
  async getLatestPoll(): Promise<Poll | null> {
    const q = query(
      collection(db, POLLS_COL),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Poll;
  },

  async getAllPolls(): Promise<Poll[]> {
    const q = query(collection(db, POLLS_COL), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poll));
  },

  async createPoll(pollData: Omit<Poll, 'id' | 'createdAt' | 'results' | 'totalVotes'>) {
    const pollRef = doc(collection(db, POLLS_COL));
    const initialResults: Record<string, number> = {};
    pollData.options.forEach(opt => {
      initialResults[opt] = 0;
    });

    await setDoc(pollRef, {
      ...pollData,
      results: initialResults,
      totalVotes: 0,
      createdAt: serverTimestamp()
    });
    return pollRef.id;
  },

  async vote(pollId: string, userId: string, option: string) {
    const responseId = `${pollId}_${userId}`;
    const responseRef = doc(db, RESPONSES_COL, responseId);
    const pollRef = doc(db, POLLS_COL, pollId);

    // Check if already voted
    const existing = await getDoc(responseRef);
    if (existing.exists()) {
      throw new Error('User already voted in this poll');
    }

    await runTransaction(db, async (transaction) => {
      const pollDoc = await transaction.get(pollRef);
      if (!pollDoc.exists()) throw new Error('Poll not found');

      const data = pollDoc.data() as Poll;
      const newResults = { ...data.results };
      newResults[option] = (newResults[option] || 0) + 1;

      transaction.set(responseRef, {
        pollId,
        userId,
        option,
        createdAt: serverTimestamp()
      });

      transaction.update(pollRef, {
        results: newResults,
        totalVotes: increment(1)
      });
    });
  },

  async hasVoted(pollId: string, userId: string): Promise<boolean> {
    const responseId = `${pollId}_${userId}`;
    const snapshot = await getDoc(doc(db, RESPONSES_COL, responseId));
    return snapshot.exists();
  },

  async updatePollStatus(pollId: string, status: 'active' | 'archived') {
    await updateDoc(doc(db, POLLS_COL, pollId), { status });
  },

  async updatePollVisibility(pollId: string, showResults: boolean) {
    await updateDoc(doc(db, POLLS_COL, pollId), { showResults });
  },

  async deletePoll(pollId: string) {
    await deleteDoc(doc(db, POLLS_COL, pollId));
  }
};
