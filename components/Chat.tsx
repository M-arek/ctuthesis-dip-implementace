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

const SHARED_INSTRUCTIONS = `
3. Jsi odborník výhradně na mezilidské vztahy. Pokud začnu mluvit o nesouvisejících věcech (např. auta, programování, vaření), zdvořile mě odmítni a nasměruj konverzaci zpět ke vztahům.
4. Umíš používat Markdown, ale používej ho pouze pro zvýraznění.
5. Na úplný začátek své odpovědi vždy napiš skrytý tag s odhadem, na kolik procent je TENTO KONKRÉTNÍ problém vyřešen (např. [PROGRESS: 10]). 100 % znamená pouze to, že jsme pro tento jeden konkrétní problém našli řešení nebo akční krok (nehledáme celoživotní dokonalost vztahu). Až za tímto tagem pokračuj textem.`;

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
    const systemPrompt = `Ahoj, jmenuji se ${profile.name}. Má aktuální situace: ${profile.status}. Můj hlavní problém: ${problem}. V naší konverzaci mi prosím od teď ${profile.tone}.

INSTRUKCE PRO TEBE:
1. Přivítej mě a navrhni mi, jak můžeme tento můj problém řešit.
2. Oslov mě mým jménem (v 5. pádu) POUZE v této tvé úplně první zprávě. V dalších zprávách už mé jméno nikdy neopakuj.${SHARED_INSTRUCTIONS}`;

    const initialHistory: Message[] = [{ role: 'user', content: systemPrompt }];
    const newConversation: Conversation = {
      id: chatId,
      title: problem.substring(0, 20) + '...',
      history: initialHistory
    };

    addConversation(newConversation);
    await handleBotResponse(chatId, initialHistory);
  };

  const handleNewChat = async () => {
    if (!state.userProfile) return;

    const chatId = Date.now().toString();
    const hiddenContext = `Ahoj, jmenuji se ${state.userProfile.name}. Má aktuální situace: ${state.userProfile.status}. V naší konverzaci mi prosím od teď ${state.userProfile.tone}.

INSTRUKCE PRO TEBE:
1. Napiš mi stručný a přátelský pozdrav a zeptej se, co dnes probereme.
2. Oslov mě mým jménem (v 5. pádu) POUZE v této tvé úplně první zprávě. V dalších zprávách už mé jméno nikdy neopakuj.${SHARED_INSTRUCTIONS}`;

    const initialHistory: Message[] = [{ role: 'user', content: hiddenContext }];
    const newConversation: Conversation = {
      id: chatId,
      title: 'Nová konverzace',
      history: initialHistory
    };

    addConversation(newConversation);
    await handleBotResponse(chatId, initialHistory);
  };

  const handleSendMessage = async (message: string) => {
    if (!state.currentChatId) return;

    const currentConv = getCurrentConversation();
    if (!currentConv) return;

    const userMessage: Message = { role: 'user', content: message };
    const updatedHistory = [...currentConv.history, userMessage];
    const newTitle = currentConv.title === 'Nová konverzace' ? message.substring(0, 20) + '...' : currentConv.title;

    updateConversation(state.currentChatId, (conv) => ({
      ...conv,
      history: updatedHistory,
      title: newTitle
    }));

    // Pass the updated history directly to avoid stale React state closure
    await handleBotResponse(state.currentChatId, updatedHistory);
  };

  const handleBotResponse = async (chatId: string, historyToSend?: Message[]) => {
    setIsLoadingMessage(true);

    try {
      // Use the directly passed history to avoid stale state closure
      const conversation = state.conversations.find(c => c.id === chatId);
      const history = historyToSend ?? conversation?.history;
      if (!history) {
        console.error('handleBotResponse: no history found for chatId', chatId);
        return;
      }

      const data = await fetchAIResponse(history);

      let replyText = data.reply;
      let newProgress: number | undefined;

      // Extract optional leading [PROGRESS: XX] tag (allow whitespace before/after tag)
      const progressMatch = replyText.match(/^\s*\[PROGRESS:\s*(\d+)\]\s*/i);
      if (progressMatch) {
        newProgress = Math.min(100, Math.max(0, parseInt(progressMatch[1], 10)));
        replyText = replyText.slice(progressMatch[0].length).trim();
      }

      updateConversation(chatId, (conv) => ({
        ...conv,
        history: [...conv.history, { role: 'assistant', content: replyText }],
        ...(newProgress !== undefined ? { progress: newProgress } : {})
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

  const progress = currentConversation?.progress ?? 0;

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

        {currentConversation && (
          <div className="px-4 md:px-8 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-1.5 transition-all duration-500 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{progress}%</span>
          </div>
        )}

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
