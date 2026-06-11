import { apiFetch } from './client';

export type ChatSource = {
  thesis_id: number;
  title: string | null;
  author: string | null;
  year: number | null;
  excerpt: string;
};

export type ChatResponse = {
  answer: string;
  sources: ChatSource[];
};

export async function postChat(token: string, question: string): Promise<ChatResponse> {
  return apiFetch<ChatResponse>('/api/chat', {
    method: 'POST',
    body: { question },
    token,
  });
}
