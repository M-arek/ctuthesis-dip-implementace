export interface UserProfile {
  name: string;
  status: string;
  tone: string;
  vocativeName?: string;
  memory?: string[]; // NOVÉ: Pole pro ukládání faktů
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  history: Message[];
  progress?: number;
}

export interface AppState {
  userProfile: UserProfile | null;
  conversations: Conversation[];
  currentChatId: string | null;
}
