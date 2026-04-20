import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(date: any): string {
  if (!date) return 'N/A';
  
  let d: Date;
  if (typeof date === 'string') {
    if (date.includes('-')) {
        const [year, month, day] = date.split('-');
        d = new Date(Number(year), Number(month) - 1, Number(day));
    } else {
        d = new Date(date);
    }
  } else if (date.seconds) {
    d = new Date(date.seconds * 1000);
  } else {
    d = new Date(date);
  }

  if (isNaN(d.getTime())) return 'N/A';

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const generateUserId = () => {
  let id = localStorage.getItem('blog_user_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('blog_user_id', id);
  }
  return id;
};
