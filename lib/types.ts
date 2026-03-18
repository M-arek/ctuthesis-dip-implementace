export interface UserProfile {
  name: string;
  status: string;
  tone: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  history: Message[];
}

export interface AppState {
  userProfile: UserProfile | null;
  conversations: Conversation[];
  currentChatId: string | null;
}
