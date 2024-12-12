// src/features/poem-analyzer/PoemAnalyzer.tsx
import React, { useRef, useState } from 'react';
import { PoemDisplay } from './components/PoemDisplay';
import { FileUpload } from './components/FileUpload';
import { usePoemFile } from './hooks/usePoemFile';
import ChatInterface from './components/ChatInterface';
import { Word, Line } from './types/poem';

interface PoemAnalyzerProps {
  className?: string;
}

type ChatInterfaceRef = {
  handleUserSelection: (unit: Word | Line) => void;
};

const PoemAnalyzer: React.FC<PoemAnalyzerProps> = () => {
  const { poem, isFileUploaded, error, handleFileUpload, resetPoem } = usePoemFile();
  const [selectionMode, setSelectionMode] = useState<'word' | 'line'>('word');
  const chatInterfaceRef = useRef<ChatInterfaceRef>(null);

  const handleSelection = (item: Word | Line) => {
    alert(item.getMetadata());
    
    if (chatInterfaceRef.current?.handleUserSelection) {
      chatInterfaceRef.current.handleUserSelection(item);
    }
  };

  return (
    <div className="h-screen flex flex-col p-4">
      {!isFileUploaded ? (
        <FileUpload onFileUpload={handleFileUpload} error={error} />
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <div className="space-x-2">
              <button
                className={`px-4 py-2 rounded ${
                  selectionMode === 'word' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => setSelectionMode('word')}
              >
                Word Mode
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  selectionMode === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => setSelectionMode('line')}
              >
                Line Mode
              </button>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={resetPoem}
            >
              Upload New Poem
            </button>
          </div>
          <div className="flex-grow flex gap-4 min-h-0">
            <div className="w-1/2 border rounded-lg overflow-hidden">
              {poem && (
                <PoemDisplay
                  poem={poem}
                  selectionMode={selectionMode}
                  onSelection={handleSelection}
                />
              )}
            </div>
            <div className="w-1/2 border rounded-lg overflow-hidden">
              <ChatInterface 
                ref={chatInterfaceRef}
                poem={poem}
                onSendMessage={(message) => {
                  console.log('Message sent:', message);
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PoemAnalyzer;