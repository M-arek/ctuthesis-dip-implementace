'use client';

import { useState, useEffect } from 'react';
import { AppState, Conversation, UserProfile } from '@/lib/types';
import {
  loadUserProfile,
  saveUserProfile,
  loadConversations,
  saveConversations
} from '@/lib/storage';

export function useAppState() {
  const [state, setState] = useState<AppState>({
    userProfile: null,
    conversations: [],
    currentChatId: null
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const profile = loadUserProfile();
    const conversations = loadConversations();
    setState({
      userProfile: profile,
      conversations,
      currentChatId: conversations.length > 0 ? conversations[0].id : null
    });
    setIsLoading(false);
  }, []);

  const setUserProfile = (profile: UserProfile | null) => {
    setState(prev => ({ ...prev, userProfile: profile }));
    saveUserProfile(profile);
  };

  const setConversations = (conversations: Conversation[]) => {
    setState(prev => ({ ...prev, conversations }));
    saveConversations(conversations);
  };

  const setCurrentChatId = (chatId: string | null) => {
    setState(prev => ({ ...prev, currentChatId: chatId }));
  };

  const addConversation = (conversation: Conversation) => {
    const newConversations = [conversation, ...state.conversations];
    setConversations(newConversations);
    setCurrentChatId(conversation.id);
  };

  const updateConversation = (chatId: string, updater: (conv: Conversation) => Conversation) => {
    const newConversations = state.conversations.map(c =>
      c.id === chatId ? updater(c) : c
    );
    setConversations(newConversations);
  };

  const getCurrentConversation = () => {
    return state.conversations.find(c => c.id === state.currentChatId);
  };

  return {
    state,
    isLoading,
    setUserProfile,
    setConversations,
    setCurrentChatId,
    addConversation,
    updateConversation,
    getCurrentConversation
  };
}
