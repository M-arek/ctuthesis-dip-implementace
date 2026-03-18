'use client';

import { useState } from 'react';
import { marked } from 'marked';
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
        <div className="flex flex-col items-end max-w-[85%] w-full">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tr-sm px-5 py-3 text-gray-800 dark:text-gray-100 break-words w-fit inline-block">
            <div dangerouslySetInnerHTML={{ __html: escapeHTML(message.content).replace(/\n/g, '<br>') }} />
          </div>
          <button
            onClick={handleCopy}
            className={`copy-btn mt-2 mr-1 flex items-center gap-1 text-xs transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ${
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

  const formattedText = marked.parse(message.content) as string;

  return (
    <div className="flex gap-4 max-w-3xl mx-auto w-full group">
      <div className="w-8 h-8 mt-1 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xs shadow-md">
        ✨
      </div>
      <div className="text-gray-800 dark:text-gray-200 leading-relaxed max-w-[85%] w-full flex flex-col items-start">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm inline-block w-fit overflow-hidden">
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 marker:text-primary"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        </div>
        <button
          onClick={handleCopy}
          className={`copy-btn mt-2 ml-1 flex items-center gap-1 text-xs transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ${
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
