'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { useTheme } from '@/hooks/useTheme';
import { fetchAIResponse } from '@/lib/api';
import { Conversation, Message, UserProfile } from '@/lib/types';
import Onboarding from '@/components/Onboarding';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ChatMessage from '@/components/ChatMessage';
import LoadingMessage from '@/components/LoadingMessage';
import ChatInput from '@/components/ChatInput';

export default function Chat() {
  const {
    state,
    isLoading: isStateLoading,
    setUserProfile,
    setCurrentChatId,
    addConversation,
    updateConversation,
    getCurrentConversation
  } = useAppState();

  const { theme, primaryColor, toggleTheme, setPrimaryColor } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [state.currentChatId, getCurrentConversation()?.history.length, isLoadingMessage]);

  const handleOnboardingComplete = async (profile: UserProfile, problem: string) => {
    setUserProfile(profile);

    const chatId = Date.now().toString();
    const systemPrompt = `Ahoj, jmenuji se ${profile.name}. Má aktuální situace: ${profile.status}. Můj hlavní problém: ${problem}. V naší konverzaci mi prosím od teď ${profile.tone}. Přivítej mě a navrhni mi, jak můžeme tento problém řešit. Umíš používat Markdown, ale používej ho pouze pro zvýraznění.`;

    const newConversation: Conversation = {
      id: chatId,
      title: problem.substring(0, 20) + '...',
      history: [{ role: 'user', content: systemPrompt }]
    };

    addConversation(newConversation);
    await handleBotResponse(chatId, `Ahoj Couplii! Jmenuji se ${profile.name} a trápí mě toto: ${problem}`);
  };

  const handleNewChat = async () => {
    if (!state.userProfile) return;

    const chatId = Date.now().toString();
    const hiddenContext = `Ahoj, jmenuji se ${state.userProfile.name}. Má aktuální situace: ${state.userProfile.status}. V naší konverzaci mi prosím od teď ${state.userProfile.tone}. Napiš mi stručný a přátelský pozdrav (použij mé jméno v 5. pádu) a zeptej se, co dnes probereme. Umíš používat Markdown, ale používej ho pouze pro zvýraznění`;

    const newConversation: Conversation = {
      id: chatId,
      title: 'Nová konverzace',
      history: [{ role: 'user', content: hiddenContext }]
    };

    addConversation(newConversation);
    await handleBotResponse(chatId);
  };

  const handleSendMessage = async (message: string) => {
    if (!state.currentChatId) return;

    const userMessage: Message = { role: 'user', content: message };

    updateConversation(state.currentChatId, (conv) => {
      const newHistory = [...conv.history, userMessage];
      const newTitle = conv.title === 'Nová konverzace' ? message.substring(0, 20) + '...' : conv.title;
      return { ...conv, history: newHistory, title: newTitle };
    });

    await handleBotResponse(state.currentChatId);
  };

  const handleBotResponse = async (chatId: string, displayMessage?: string) => {
    setIsLoadingMessage(true);

    try {
      const conversation = state.conversations.find(c => c.id === chatId);
      if (!conversation) return;

      const data = await fetchAIResponse(conversation.history);

      updateConversation(chatId, (conv) => ({
        ...conv,
        history: [...conv.history, { role: 'assistant', content: data.reply }]
      }));
    } catch (error) {
      updateConversation(chatId, (conv) => {
        const newHistory = [...conv.history];
        if (newHistory[newHistory.length - 1]?.role === 'user') {
          newHistory.pop();
        }
        newHistory.push({ role: 'assistant', content: 'Jejda, spojení selhalo.' });
        return { ...conv, history: newHistory };
      });
    } finally {
      setIsLoadingMessage(false);
    }
  };

  if (isStateLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[100dvh] bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Načítání...</p>
        </div>
      </div>
    );
  }

  if (!state.userProfile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const currentConversation = getCurrentConversation();
  const displayMessages = currentConversation?.history.filter((msg, index) => {
    if (index === 0 && msg.role === 'user' && msg.content.includes('jmenuji se')) {
      return false;
    }
    return true;
  }) || [];

  return (
    <div className="flex-1 flex h-[100dvh] w-full bg-white dark:bg-gray-900 transition-colors duration-300">
      <Sidebar
        conversations={state.conversations}
        currentChatId={state.currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={setCurrentChatId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-full relative w-full">
        <Header
          theme={theme}
          primaryColor={primaryColor}
          onToggleTheme={toggleTheme}
          onColorChange={setPrimaryColor}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto chat-scroll p-4 md:p-8 space-y-6 pb-4">
          {displayMessages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoadingMessage && <LoadingMessage />}
        </div>

        <ChatInput onSendMessage={handleSendMessage} disabled={isLoadingMessage} />
      </main>
    </div>
  );
}
