'use client';

import { useState, useEffect } from 'react';
import { AppState, Conversation, UserProfile } from '@/lib/types';
import { User } from 'firebase/auth';
import {
  getOrSignInUser,
  loadProfileFromDB,
  loadConversationsFromDB,
  saveProfileToDB,
  saveConversationToDB,
  deleteConversationFromDB
} from '@/lib/firebaseHelpers';

export function useAppState() {
  const [state, setState] = useState<AppState>({
    userProfile: null,
    conversations: [],
    currentChatId: null
  });

  const [isLoading, setIsLoading] = useState(true);
  
  // NOVÉ: Držíme si aktuálního přihlášeného uživatele (jeho ID)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Získáme tajné ID uživatele z Firebase
        const user = await getOrSignInUser();
        setCurrentUser(user);

        // 2. Stáhneme data z cloudu
        const profile = await loadProfileFromDB(user.uid);
        const conversations = await loadConversationsFromDB(user.uid);

        setState({
          userProfile: profile,
          conversations,
          currentChatId: conversations.length > 0 ? conversations[0].id : null
        });
      } catch (error) {
        console.error("Chyba při načítání z Firebase:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  const setUserProfile = (profile: UserProfile | null) => {
    setState(prev => ({ ...prev, userProfile: profile }));
    // Pošleme profil do cloudu (na pozadí, neblokuje to UI)
    if (currentUser && profile) {
      saveProfileToDB(currentUser.uid, profile);
    }
  };

  const setConversations = (conversations: Conversation[]) => {
    setState(prev => ({ ...prev, conversations }));
  };

  const setCurrentChatId = (chatId: string | null) => {
    setState(prev => ({ ...prev, currentChatId: chatId }));
  };

  const addConversation = (conversation: Conversation) => {
    setState(prev => {
      const newConversations = [conversation, ...prev.conversations];
      return { ...prev, conversations: newConversations, currentChatId: conversation.id };
    });
    
    // Pošleme nový chat do cloudu
    if (currentUser) {
      saveConversationToDB(currentUser.uid, conversation);
    }
  };

  const updateConversation = (chatId: string, updater: (conv: Conversation) => Conversation) => {
    setState(prev => {
      let updatedConv: Conversation | null = null;
      
      const newConversations = prev.conversations.map(c => {
        if (c.id === chatId) {
          updatedConv = updater(c);
          return updatedConv;
        }
        return c;
      });

      // Pošleme upravenou zprávu do cloudu (např. když AI dopíše)
      if (currentUser && updatedConv) {
        saveConversationToDB(currentUser.uid, updatedConv);
      }

      return { ...prev, conversations: newConversations };
    });
  };

  const getCurrentConversation = () => {
    return state.conversations.find(c => c.id === state.currentChatId);
  };

  const removeConversation = (chatId: string) => {
    setState((prev) => {
      const updatedConversations = prev.conversations.filter(c => c.id !== chatId);
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

    // Smažeme to i v cloudu
    if (currentUser) {
      deleteConversationFromDB(currentUser.uid, chatId);
    }
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