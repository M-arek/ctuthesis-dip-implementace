'use client';

import { useState } from 'react';
import { saveFeedbackToDB } from '@/lib/firebaseHelpers';
import { Conversation } from '@/lib/types';

interface SidebarProps {
  conversations: Conversation[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  conversations,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  isOpen,
  onClose
}: SidebarProps) {
  // STAVY PRO ZPĚTNOU VAZBU
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // FUNKCE PRO ODESLÁNÍ
  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    setIsSubmitting(true);
    
    try {
      await saveFeedbackToDB(feedbackText);
      setFeedbackSuccess(true);
      setFeedbackText('');
      
      // Za 2 vteřiny okno zavřeme a resetujeme stav
      setTimeout(() => {
        setFeedbackSuccess(false);
        setIsFeedbackOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Chyba při odesílání feedbacku:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Tmavé pozadí na mobilu */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col pt-4 z-50 transition-transform duration-300`}
      >
        <div className="px-4">
          <button
            onClick={onNewChat}
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-xl w-full mb-6 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="text-xl leading-none">+</span> Nový chat
          </button>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
            Tvé konverzace
          </div>
        </div>

        <div className="space-y-1 overflow-y-auto chat-scroll flex-1 px-4 pb-2">
          {conversations.map((chat) => {
            const isActive = chat.id === currentChatId;
            const progress = chat.progress ?? 0;
            return (
              <div
                key={chat.id}
                onClick={() => {
                  onSelectChat(chat.id);
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
                className={`group p-3 rounded-lg cursor-pointer text-sm transition relative ${
                  isActive
                    ? 'bg-secondary text-primary font-bold'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5 gap-2">
                  <div className="line-clamp-2 leading-tight flex-1" title={chat.title}>
                    {chat.title}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 flex-shrink-0 focus:opacity-100 p-1"
                    title="Smazat konverzaci"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="w-full bg-gray-300 dark:bg-gray-600 h-1 rounded-full overflow-hidden opacity-50">
                  <div
                    className={`h-1 transition-all duration-500 ${progress >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* TLAČÍTKO PRO ZPĚTNOU VAZBU (Bude vždy dole díky mt-auto) */}
        <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium text-gray-500 hover:text-primary hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            Napsat zpětnou vazbu
          </button>
        </div>
      </aside>

      {/* VYSKAKOVACÍ OKNO (MODAL) */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Jak se ti Couplii líbí?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Našli jste chybu, nápad na zlepšení nebo chcete poskytnout zpětnou vazbu? Napište nám to!
              </p>
              
              {feedbackSuccess ? (
                <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-xl text-center font-medium">
                  🎉 Děkujeme za tvůj názor!
                </div>
              ) : (
                <>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none transition mb-4"
                    placeholder="Tvoje zpětná vazba..."
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setIsFeedbackOpen(false)}
                      className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium"
                    >
                      Zrušit
                    </button>
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={isSubmitting || !feedbackText.trim()}
                      className="px-4 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-white rounded-xl transition font-medium"
                    >
                      {isSubmitting ? 'Odesílám...' : 'Odeslat'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}