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
import WelcomeFlow from './WelcomeFlow'; // Cestu si případně uprav podle toho, kam jsi soubor uložil

export default function Chat() {
  const {
    state,
    isLoading: isStateLoading,
    setUserProfile,
    setCurrentChatId,
    addConversation,
    updateConversation,
    getCurrentConversation,
    removeConversation
  } = useAppState();

  const { theme, primaryColor, toggleTheme, setPrimaryColor } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [state.currentChatId, getCurrentConversation()?.history.length, isLoadingMessage]);

  const handleOnboardingComplete = async (profile: UserProfile, problem: string) => {
    setUserProfile(profile);

    const chatId = Date.now().toString();
    const systemPrompt = `Ahoj, jmenuji se ${profile.name}. Má aktuální situace: ${profile.status}. Můj hlavní problém: ${problem}. V naší konverzaci mi prosím od teď ${profile.tone}.`;
    const initialHistory: Message[] = [{ role: 'user', content: systemPrompt }];
    
    // PŘIDÁNO: Pokud uživatel zadal problém, přidáme k první zprávě pro AI tajnou instrukci
    const historyToSend = [...initialHistory];
    if (problem.trim().length > 0) {
      historyToSend[0] = {
        ...historyToSend[0],
        content: historyToSend[0].content + "\n\n[SKRYTÁ INSTRUKCE: Na úplný začátek tvé odpovědi přidej skrytý tag s velmi krátkým názvem pro tuto konverzaci (max 3-4 slova), např. [TITLE: Hádka kvůli úklidu].]"
      };
    }

    const newConversation: Conversation = {
      id: chatId,
      title: 'Nová konverzace', // ZMĚNA: Vždy nastavíme tento výchozí název
      history: initialHistory,
      progress: 0 // Přidal jsem progress na 0, pokud ho tvůj typ Conversation vyžaduje
    };

    addConversation(newConversation);
    // ZMĚNA: Posíláme do AI upravenou historii (historyToSend), aby nám rovnou vrátila i [TITLE]
    await handleBotResponse(chatId, historyToSend, profile);
  };

  const handleNewChat = async () => {
    if (!state.userProfile) return;

    const chatId = Date.now().toString();
    // 1. Skrytý kontext pro AI

    // NOVÉ: Poskládáme všechny dosud známé informace z paměti
    const memories = state.userProfile.memory && state.userProfile.memory.length > 0 
      ? `\n\nZ minulých konverzací už o mně víš tyto zásadní věci: ${state.userProfile.memory.join('; ')}.` 
      : '';

    // Přidáme proměnnou memories nakonec neviditelného kontextu
    const hiddenContext = `Ahoj, jmenuji se ${state.userProfile.name}. Má aktuální situace: ${state.userProfile.status}. V naší konverzaci mi prosím od teď ${state.userProfile.tone}.${memories}`;
    // Zjistíme tón a 5. pád
    const isFormal = state.userProfile.tone.toLowerCase().includes('vyk');
    const vocative = state.userProfile.vocativeName;
    
    let localAiGreeting = '';
    if (isFormal) {
      localAiGreeting = `Dobrý den${vocative ? ' ' + vocative : ''}! Co byste dnes rád(a) probral(a)?`;
    } else {
      localAiGreeting = `Ahoj${vocative ? ' ' + vocative : ''}! Co bys chtěl dnes probrat?`;
    }

    const initialHistory: Message[] = [
      { role: 'user', content: hiddenContext },
      { role: 'assistant', content: localAiGreeting }
    ];

    const newConversation: Conversation = {
      id: chatId,
      title: 'Nová konverzace',
      history: initialHistory,
      progress: 0
    };

    addConversation(newConversation);
    setCurrentChatId(chatId);
  };

    

  const handleDeleteChat = (chatId: string) => {
    if (window.confirm('Opravdu chceš tuto konverzaci nenávratně smazat?')) {
      removeConversation(chatId);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!state.currentChatId) return;

    const currentConv = getCurrentConversation();
    if (!currentConv) return;

    const userMessage: Message = { role: 'user', content: message };
    const updatedHistory = [...currentConv.history, userMessage];

    // Necháme title původní ("Nová konverzace"), AI nám ho za chvíli samo pošle
    updateConversation(state.currentChatId, (conv) => ({
      ...conv,
      history: updatedHistory
    }));

    // KOPIE HISTORIE PRO AI - Zde připojíme tajnou instrukci pro název
    const historyToSend = [...updatedHistory];
    if (currentConv.title === 'Nová konverzace') {
      const lastIndex = historyToSend.length - 1;
      historyToSend[lastIndex] = {
        ...historyToSend[lastIndex],
        content: historyToSend[lastIndex].content + "\n\n[SKRYTÁ INSTRUKCE: Na úplný začátek tvé odpovědi přidej skrytý tag s velmi krátkým názvem pro tuto konverzaci (max 60 znaků), např. [TITLE: Hádka kvůli úklidu].]"
      };
    }

    await handleBotResponse(state.currentChatId, historyToSend);
  };

  const handleBotResponse = async (chatId: string, historyToSend?: Message[], freshProfile?: UserProfile) => {
    setIsLoadingMessage(true);

    try {
      const conversation = state.conversations.find(c => c.id === chatId);
      const history = historyToSend ?? conversation?.history;
      if (!history) return;

      const data = await fetchAIResponse(history);
      let replyText = data.reply;

      // 1. EXTRAKCE NÁZVU CHATU: Odchytíme např. [TITLE: Dovolená s tchyní]
      let newTitle = undefined;
      const titleMatch = replyText.match(/\[TITLE:\s*(.+?)\]/i);
      if (titleMatch) {
        newTitle = titleMatch[1].trim();
        replyText = replyText.replace(titleMatch[0], '').trim(); // Ustřihneme to z textu
      }

      // 2. EXTRAKCE PROGRESU: Odchytíme např. [PROGRESS: 15]
      let newProgress = conversation?.progress ?? 0;
      const progressMatch = replyText.match(/\[PROGRESS:\s*(\d+)\]/i);
      if (progressMatch) {
        newProgress = Math.min(100, Math.max(0, parseInt(progressMatch[1], 10)));
        replyText = replyText.replace(progressMatch[0], '').trim(); // Ustřihneme to z textu
      }

      // --- 1. NAČTENÍ AKTIVNÍHO PROFILU (Musí být hned na začátku!) ---
      const activeProfile = freshProfile || state.userProfile;

      if (activeProfile) {
        let profileUpdated = false;
        let newProfileState = { ...activeProfile };

        // --- 2. ZPRACOVÁNÍ PAMĚTI (MEMORY) ---
        const memoryMatch = replyText.match(/\[MEMORY:\s*(.*?)\]/i);
        if (memoryMatch) {
          const extractedMemory = memoryMatch[1].trim();
          replyText = replyText.replace(/\[MEMORY:\s*.*?\]/gi, '').trim(); // Smažeme tag z textu

          const currentMemories = newProfileState.memory || [];
          if (!currentMemories.includes(extractedMemory)) {
            newProfileState.memory = [...currentMemories, extractedMemory];
            profileUpdated = true; // Označíme, že se profil změnil
          }
        }

        // --- 3. ULOŽENÍ 5. PÁDU JMÉNA (Spustí se jen, když ho ještě nemáme) ---
        if (!newProfileState.vocativeName) {
          const vocativeMatch = replyText.match(/(?:Ahoj|Zdravím|Dobrý den)[,\s]+([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽa-záčďéěíňóřšťúůýž]+)[!.,]?/i);
          if (vocativeMatch) {
            const zachyceno = vocativeMatch[1];
            if (zachyceno.toLowerCase() !== 'pane' && zachyceno.toLowerCase() !== 'paní') {
              newProfileState.vocativeName = zachyceno;
              profileUpdated = true; // Označíme, že se profil změnil
            }
          }
        }

        // --- 4. HROMADNÉ ULOŽENÍ DO PROFILU ---
        // Uloží se jen tehdy, pokud jsme buď chytili novou paměť, nebo nové jméno
        if (profileUpdated) {
          setUserProfile(newProfileState);
        }
      }
      
      // 4. ULOŽENÍ DO STAVU
      updateConversation(chatId, (conv) => ({
        ...conv,
        history: [...conv.history, { role: 'assistant', content: replyText }],
        progress: newProgress,
        ...(newTitle ? { title: newTitle } : {}) // Pokud se vygeneroval název, uloží se
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
  // Nejprve ukážeme uvítání. Jakmile ho odkliká, showWelcome se změní na false.
  if (showWelcome) {
    return <WelcomeFlow onFinishWelcome={() => setShowWelcome(false)} />;
  }
  
  // Až když je showWelcome false, pustíme ho k samotnému dotazníku
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
        onDeleteChat={handleDeleteChat}
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
          // NOVÉ: Pošleme procenta jen tehdy, když jsme v nějakém chatu
          progress={currentConversation ? progress : undefined} 
        />

        {/* PODMÍNKA: Pokud nemáme žádný chat (smazali jsme všechno) */}
        {!currentConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="w-20 h-20 mb-6 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-4xl shadow-sm border border-gray-100 dark:border-gray-700">
              💬
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Žádná aktivní konverzace
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
              Vyberte si některou ze starších konverzací v levém menu, nebo začněte úplně nové téma.
            </p>
            <button
              onClick={handleNewChat}
              className="bg-primary hover:opacity-90 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-md flex items-center gap-2"
            >
              <span className="text-xl leading-none">+</span> Vytvořit nový chat
            </button>
          </div>
        ) : (
          /* POKUD CHAT EXISTUJE, ZOBRAZÍME KLASICKÉ UI */
          <>
            {/*
            <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 z-10 relative shadow-sm">
              <div
                className={`h-1.5 transition-all duration-500 ease-out ${progress >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            */}

            {/*
            <div className="px-4 md:px-8 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-1.5 transition-all duration-500 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${progress}%` }}
              />
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{progress}%</span>
            </div>
            */}

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto chat-scroll p-4 md:p-8 space-y-6 pb-4">
              {displayMessages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
              {isLoadingMessage && <LoadingMessage />}
            </div>

            <ChatInput onSendMessage={handleSendMessage} disabled={isLoadingMessage} />
          </>
        )}
      </main>
    </div>
  );
}
