'use client';

import { Conversation } from '@/lib/types';

interface SidebarProps {
  conversations: Conversation[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  conversations,
  currentChatId,
  onNewChat,
  onSelectChat,
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
        <div className="space-y-1 overflow-y-auto chat-scroll flex-1">
          {conversations.map((chat) => {
            const isActive = chat.id === currentChatId;
            return (
              <div
                key={chat.id}
                onClick={() => {
                  onSelectChat(chat.id);
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
                className={`p-3 rounded-lg cursor-pointer text-sm truncate transition ${
                  isActive
                    ? 'bg-secondary text-primary font-bold'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {chat.title}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
