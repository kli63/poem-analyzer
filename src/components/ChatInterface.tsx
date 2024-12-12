// src/components/ChatInterface.tsx

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
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
}

const ChatInterface = forwardRef<{ handleUserSelection: (unit: Word | Line) => void }, ChatInterfaceProps>(
  ({ poem }, ref) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userContext, setUserContext] = useState('');
    const [currentlyTyping, setCurrentlyTyping] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
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

    useImperativeHandle(ref, () => ({
      handleUserSelection
    }));

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
      const isWord = unit instanceof Word;
      const prompt = bot['createPrompt'](poem, unit, userContext);
      
      setMessages(prev => [...prev, {
        type: 'user',
        content: `Analyze this ${isWord ? 'word' : 'line'}: "${unit.toString()}"`,
        metadata: unit.getMetadata(),
        prompt: prompt
      }]);

      await bot.generateResponse(poem, unit, userContext);
    };

    return (
      <div className="flex flex-col h-full">
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

        <div 
          ref={chatContainerRef}
          className="flex-grow bg-gray-50 p-4 overflow-y-auto"
          style={{ 
            height: 'calc(100vh - 200px)',
            maxHeight: 'calc(100vh - 200px)'
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
                {(message.metadata || message.prompt) && (
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
                )}
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
              Select a word or line to begin analysis
            </div>
          )}
        </div>
      </div>
    );
  }
);

ChatInterface.displayName = 'ChatInterface';

export default ChatInterface;