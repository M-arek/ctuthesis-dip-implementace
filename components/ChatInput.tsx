'use client';

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent, FormEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'cs-CZ';
      recognition.continuous = false;
      recognition.interimResults = true;

      let originalText = '';

      recognition.onstart = () => {
        setIsRecording(true);
        originalText = message + (message.trim() !== '' ? ' ' : '');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setMessage(originalText + transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Chyba diktování:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [message]);

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '1px';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() !== '') {
        handleSubmit(e as any);
      }
    }
  };

  const toggleRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!recognitionRef.current) return;

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Chyba při zastavování mikrofonu:', err);
      }
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Mikrofon už běží nebo se teprve spouští.');
      }
    }
  };

  return (
    <div className="shrink-0 bg-white dark:bg-gray-900 pt-2 pb-[calc(1.5rem+env(safe-area-inset-bottom))] px-4 md:px-8 relative z-20">
      <div className="absolute bottom-full left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative">
        <form onSubmit={handleSubmit} className="relative flex items-end border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            className="w-full max-h-32 py-3.5 pl-5 pr-24 bg-transparent text-gray-800 dark:text-white outline-none resize-none overflow-y-auto chat-scroll rounded-2xl min-h-[64px] leading-relaxed"
            placeholder="Napiš zprávu..."
            disabled={disabled}
          />

          <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
            {recognitionRef.current && (
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2 focus:outline-none transition-colors ${
                  isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'
                }`}
                title="Diktovat hlasem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="p-2 text-gray-400 hover:text-primary transition-colors disabled:opacity-30 disabled:hover:text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
