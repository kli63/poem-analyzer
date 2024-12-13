// src/features/poem-analyzer/components/ChatInterface.tsx

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Word, Line, Poem } from '../types/poem';
import { Bot } from './Bot';

interface Message {
  type: 'user' | 'bot';
  content: string;
  metadata?: string;
  prompt?: string;
}

interface ChatInterfaceProps {
  poem: Poem | null;
  onSendMessage?: (message: string) => void;
  containerWidthPercent: number;
}

export type ChatInterfaceHandle = {
  handleUserSelection: (unit: Word | Line) => void;
};

const ChatInterface = forwardRef<ChatInterfaceHandle, ChatInterfaceProps>(
  ({ poem, containerWidthPercent }, ref) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userContext, setUserContext] = useState('');
    const [currentlyTyping, setCurrentlyTyping] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState<number>(12);
    const [originalFontSize, setOriginalFontSize] = useState<number>(12);

    const tryFitFontSize = useCallback((desiredSize: number) => {
      if (!chatContainerRef.current) return desiredSize;
      let fittedSize = 6;
      for (let testSize = desiredSize; testSize >= 6; testSize--) {
        chatContainerRef.current.style.fontSize = `${testSize}px`;
        const scrollWidth = chatContainerRef.current.scrollWidth;
        const clientWidth = chatContainerRef.current.clientWidth;
        if (scrollWidth <= clientWidth) {
          fittedSize = testSize;
          break;
        }
      }
      return fittedSize;
    }, []);

    const refitContent = useCallback(() => {
      const fittedSize = tryFitFontSize(originalFontSize);
      setFontSize(prev => prev !== fittedSize ? fittedSize : prev);
    }, [originalFontSize, tryFitFontSize]);

    useEffect(() => {
      refitContent();
    }, [containerWidthPercent, poem, refitContent]);

    const bot = new Bot({
      onResponse: (response: string) => {
        setMessages(prev => [...prev, { type: 'bot', content: response }]);
      },
      onTyping: (text: string) => {
        setCurrentlyTyping(text);
      },
      setIsLoading: (loading: boolean) => {
        setIsLoading(loading);
      }
    });

    useEffect(() => {
      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, []);

    useEffect(() => {
      if (chatContainerRef.current) {
        const { scrollHeight, clientHeight } = chatContainerRef.current;
        chatContainerRef.current.scrollTo({
          top: scrollHeight - clientHeight,
          behavior: 'smooth'
        });
      }
    }, [messages, currentlyTyping]);

    const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= 500) {
        setUserContext(value);
      }
    };

    const handleUserSelection = async (unit: Word | Line) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setCurrentlyTyping('');
      }
    
      abortControllerRef.current = new AbortController();
    
      const isWord = unit instanceof Word;
      const prompt = bot['createPrompt'](poem, unit, userContext);
    
      setMessages(prev => [...prev, {
        type: 'user',
        content: `What do you think about this ${isWord ? 'word' : 'line'}: "${unit.toString()}"`,
        metadata: unit.getMetadata(),
        prompt: prompt
      }]);
    
      try {
        await bot.generateResponse(poem, unit, userContext, abortControllerRef.current.signal);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.name === 'AbortError' || error.message === 'AbortError') {
            setCurrentlyTyping('');
            setIsLoading(false);
          } else {
            console.error('Error generating response:', error);
          }
        } else {
          console.error('Unknown error:', error);
        }
      }
    };

    useImperativeHandle(ref, () => ({
      handleUserSelection
    }));

    const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newSize = parseInt(event.target.value, 10);
      if (!isNaN(newSize) && newSize >= 6 && newSize <= 48) {
        setOriginalFontSize(newSize);
        const fittedSize = tryFitFontSize(newSize);
        setFontSize(prev => prev !== fittedSize ? fittedSize : prev);
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      const value = parseInt(event.target.value, 10);
      const sizeToFit = isNaN(value) ? 12 : Math.max(6, Math.min(48, value));
      setOriginalFontSize(sizeToFit);
      const fittedSize = tryFitFontSize(sizeToFit);
      setFontSize(prev => prev !== fittedSize ? fittedSize : prev);
    };

    const decrementFontSize = () => {
      const newSize = Math.max(6, originalFontSize - 1);
      setOriginalFontSize(newSize);
      const fitted = tryFitFontSize(newSize);
      setFontSize(prev => prev !== fitted ? fitted : prev);
    };

    const incrementFontSize = () => {
      const newSize = Math.min(48, originalFontSize + 1);
      setOriginalFontSize(newSize);
      const fitted = tryFitFontSize(newSize);
      setFontSize(prev => prev !== fitted ? fitted : prev);
    };

    return (
      <div className="flex flex-col h-full" style={{height: '100%', boxSizing: 'border-box'}}>
        <div className="p-4 border-b">
          <textarea
            value={userContext}
            onChange={handleContextChange}
            placeholder="Add context about your poem and what kind of feedback you're looking for (max 500 characters)"
            className="w-full p-2 border rounded-lg resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-500">
            {userContext.length}/500 characters
          </div>
        </div>

        <div className="flex justify-end items-center gap-1 p-2 bg-gray-100 border-b">
          <button 
            onClick={decrementFontSize} 
            disabled={originalFontSize <= 6} 
            className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            -
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="text-center w-12 h-6 text-sm border rounded"
            value={fontSize}
            onChange={handleFontSizeChange}
            onBlur={handleBlur}
          />
          <button
            onClick={incrementFontSize}
            disabled={originalFontSize >= 48}
            className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            +
          </button>
        </div>

        <div 
          ref={chatContainerRef}
          className="flex-grow bg-gray-50 p-4 overflow-y-auto"
          style={{ 
            fontSize: `${fontSize}px`, 
            lineHeight: '1.4',
            boxSizing: 'border-box'
          }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {/* {(message.metadata || message.prompt) && (
                  <div className="mt-2 text-xs opacity-75 text-left whitespace-pre-wrap">
                    {message.metadata && (
                      <div className="mb-2">
                        <strong>Analysis Context:</strong>
                        <div>{message.metadata}</div>
                      </div>
                    )}
                    {message.prompt && (
                      <div>
                        <strong>Prompt:</strong>
                        <div>{message.prompt}</div>
                      </div>
                    )}
                  </div>
                )} */}
              </div>
            </div>
          ))}
          {(isLoading || currentlyTyping) && (
            <div className="mb-4 text-left">
              <div className="inline-block max-w-[80%] p-3 rounded-lg bg-white border">
                {isLoading && !currentlyTyping ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating feedback...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{currentlyTyping}</div>
                )}
              </div>
            </div>
          )}
          {messages.length === 0 && !currentlyTyping && !isLoading && (
            <div className="text-gray-500 text-center mt-4">
              Select a word or line to receive feedback
            </div>
          )}
        </div>
      </div>
    );
  }
);

ChatInterface.displayName = 'ChatInterface';

export default ChatInterface;