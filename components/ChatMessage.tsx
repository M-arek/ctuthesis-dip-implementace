'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/lib/types';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Chyba při kopírování:', err);
    }
  };

  const escapeHTML = (str: string) => {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  };

  if (message.role === 'user') {
    return (
      <div className="flex gap-4 max-w-3xl mx-auto w-full group flex-row-reverse">
        {/* PŘIDÁNO: relative */}
        <div className="flex flex-col items-end max-w-[85%] w-full relative">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tr-sm px-5 py-3 text-gray-800 dark:text-gray-100 break-words w-fit inline-block">
            <div dangerouslySetInnerHTML={{ __html: escapeHTML(message.content).replace(/\n/g, '<br>') }} />
          </div>
          {/* ZMĚNĚNO: mt-2 mr-1 nahrazeno za absolute -bottom-5 right-1 */}
          <button
            onClick={handleCopy}
            className={`copy-btn absolute -bottom-5 right-1 flex items-center gap-1 text-xs transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ${
              copied ? 'text-green-500 opacity-100' : 'text-gray-400 hover:text-primary'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {copied ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              )}
            </svg>
            <span>{copied ? 'Zkopírováno!' : 'Zkopírovat'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="flex gap-4 max-w-3xl mx-auto w-full group">
    
    {/* ZMĚNA: Profesionální AI avatar místo emotikonu */}
    <div className="w-8 h-8 mt-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0 flex items-center justify-center text-primary shadow-sm">
      
      {/* Vektorová SVG ikona (AI Sparkle) - barvu přebírá z text-secondary výše */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-4 h-4"
      >
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
      </svg>
      
    </div>
    
    {/* ... zbytek tvého kódu (bublina se zprávou atd.) ... */}
      {/* PŘIDÁNO: relative */}
      <div className="text-gray-800 dark:text-gray-200 leading-relaxed max-w-[85%] w-full flex flex-col items-start relative">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm inline-block w-fit overflow-hidden">
          {/* OPRAVENO: Odstraněn překlep "prose prose" na "prose" */}
          <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 [&_li::marker]:text-primary [&_li::marker]:font-bold">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
        {/* ZMĚNĚNO: mt-2 ml-1 nahrazeno za absolute -bottom-5 left-1 */}
        <button
          onClick={handleCopy}
          className={`copy-btn absolute -bottom-5 left-1 flex items-center gap-1 text-xs transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ${
            copied ? 'text-green-500 opacity-100' : 'text-gray-400 hover:text-primary'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {copied ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            )}
          </svg>
          <span>{copied ? 'Zkopírováno!' : 'Zkopírovat'}</span>
        </button>
      </div>
    </div>
  );
}