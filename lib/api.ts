import { Message } from './types';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://ctuthesis-dip-implementace.onrender.com";

export async function fetchAIResponse(history: Message[]): Promise<{ reply: string }> {
  const response = await fetch(`${backendUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history })
  });

  if (!response.ok) throw new Error("Chyba serveru");
  return await response.json();
}
