'use client';

import { Conversation } from '@/lib/types';

interface SidebarProps {
  conversations: Conversation[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void; // NOVÁ FUNKCE
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
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col p-4 z-50 transition-transform duration-300`}
      >
        <button
          onClick={onNewChat}
          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-xl w-full mb-6 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <span className="text-xl leading-none">+</span> Nový chat
        </button>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
          Tvé konverzace
        </div>
        <div className="space-y-1 overflow-y-auto chat-scroll flex-1 pr-1">
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
                {/* Obalení názvu a popelnice do Flex kontejneru */}
                <div className="flex justify-between items-start mb-1.5 gap-2">
                  {/* ZMĚNA: Používáme line-clamp-2 místo truncate pro zalamování na 2 řádky */}
                  <div className="line-clamp-2 leading-tight flex-1" title={chat.title}>
                    {chat.title}
                  </div>
                  
                  {/* TLAČÍTKO SMAZAT: Objeví se po najetí myší */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Zabraní tomu, aby se chat zároveň i otevřel, když ho mažeš
                      onDeleteChat(chat.id);
                    }}
                    /*className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 flex-shrink-0 focus:opacity-100"*/
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
      </aside>
    </>
  );
}