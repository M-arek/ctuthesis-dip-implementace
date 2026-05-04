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
    setState(prev => {
      saveConversations(conversations);
      return { ...prev, conversations };
    });
  };

  const setCurrentChatId = (chatId: string | null) => {
    setState(prev => ({ ...prev, currentChatId: chatId }));
  };

  const addConversation = (conversation: Conversation) => {
    setState(prev => {
      const newConversations = [conversation, ...prev.conversations];
      saveConversations(newConversations);
      return { ...prev, conversations: newConversations, currentChatId: conversation.id };
    });
    console.debug('[useAppState] addConversation -> scheduled add for', conversation.id);
  };

  const updateConversation = (chatId: string, updater: (conv: Conversation) => Conversation) => {
    console.debug('[useAppState] updateConversation called for chatId', chatId);
    setState(prev => {
      const newConversations = prev.conversations.map(c => (c.id === chatId ? updater(c) : c));
      saveConversations(newConversations);
      console.debug('[useAppState] updateConversation -> newConversations length', newConversations.length);
      return { ...prev, conversations: newConversations };
    });
  };

  const getCurrentConversation = () => {
    return state.conversations.find(c => c.id === state.currentChatId);
  };

  // Nová funkce pro smazání chatu
  const removeConversation = (chatId: string) => {
    setState((prev) => {
      const updatedConversations = prev.conversations.filter(c => c.id !== chatId);
      
      // Pokud mažeme chat, ve kterém právě jsme, přeskočíme na nějaký jiný (nebo na prázdnou plochu)
      let nextChatId = prev.currentChatId;
      if (prev.currentChatId === chatId) {
        nextChatId = updatedConversations.length > 0 ? updatedConversations[0].id : null;
      }

      return {
        ...prev,
        conversations: updatedConversations,
        currentChatId: nextChatId
      };
    });
  };

  return {
    state,
    isLoading,
    setUserProfile,
    setConversations,
    setCurrentChatId,
    addConversation,
    updateConversation,
    getCurrentConversation,
    removeConversation
  };
}


