// PoemAnalyzer.tsx

import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Poem, Word, Line, Stanza, parsePoemFromText, LineElement, } from '../types/poem';
import ChatInterface from './ChatInterface';

interface PoemAnalyzerProps {
  className?: string;
}

type ChatInterfaceRef = {
  handleUserSelection: (unit: Word | Line) => void;
};

const PoemAnalyzer: React.FC<PoemAnalyzerProps> = () => {
  const [poem, setPoem] = useState<Poem | null>(null);
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);
  const [selectionMode, setSelectionMode] = useState<'word' | 'line'>('word');
  const [error, setError] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(16);
  const chatInterfaceRef = useRef<ChatInterfaceRef>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    if (file.type !== 'text/plain') {
      setError('Please upload only .txt files');
      return;
    }

    try {
      const text = await file.text();
      const parsedPoem = parsePoemFromText(text);
      setPoem(parsedPoem);
      setIsFileUploaded(true);
      setError('');
    } catch {
      setError('Error reading file');
    }
  };

  const handleSelection = (item: Word | Line) => {
    // show the metadata as an alert for sanity check lol
    alert(item.getMetadata());

    // pass the selection to ChatInterface
    if (chatInterfaceRef.current?.handleUserSelection) {
      chatInterfaceRef.current.handleUserSelection(item);
    }
  };

  const PoemDisplay: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      if (!containerRef.current) return;
    
      const adjustFontSize = () => {
        const container = containerRef.current;
        if (!container) return;
        
        const containerWidth = container.clientWidth;
        let testSize = 16;
        const minSize = 8;
        const maxSize = 24;
    
        let min = minSize;
        let max = maxSize;
    
        while (min <= max) {
          testSize = Math.floor((min + max) / 2);
          container.style.fontSize = `${testSize}px`;
    
          const isOverflowing = Array.from(container.querySelectorAll('.line-content'))
            .some(line => (line as HTMLElement).scrollWidth > containerWidth);
    
          if (isOverflowing) {
            max = testSize - 1;
          } else {
            min = testSize + 1;
          }
        }
    
        setFontSize(max);
      };
    
      adjustFontSize();
      window.addEventListener('resize', adjustFontSize);
      return () => window.removeEventListener('resize', adjustFontSize);
    }, []);

    if (!poem) return null;

    return (
      <div ref={containerRef} style={{ fontSize: `${fontSize}px` }} className="whitespace-pre">
        {poem.stanzas.map((stanza: Stanza, stanzaIndex: number) => (
          <div key={stanzaIndex} className="mb-8">
            {stanza.lines.map((line: Line, lineIndex: number) => (
              <div
                key={`${stanzaIndex}-${lineIndex}`}
                className={selectionMode === 'line' ? 'cursor-pointer hover:bg-blue-100' : ''}
                onClick={() => selectionMode === 'line' && handleSelection(line)}
              >
                <div 
                  className="line-content"
                  style={{ 
                    paddingLeft: `${line.indentation * 0.5}em`,
                    display: 'block',
                    width: '100%'
                  }}
                >
                  {line.elements.map((element: LineElement, elementIndex: number) => {
                    if (element instanceof Word) {
                      return (
                        <span
                          key={elementIndex}
                          onClick={(e) => {
                            if (selectionMode === 'word') {
                              e.stopPropagation();
                              handleSelection(element);
                            }
                          }}
                          className={selectionMode === 'word' ? 'cursor-pointer hover:bg-blue-100' : ''}
                        >
                          {element.toString()}
                        </span>
                      );
                    } else {
                      return <span key={elementIndex}>{element.toString()}</span>;
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col p-4">
      {!isFileUploaded ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <label className="block mb-4">
              <span className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600">
                Upload Poem (txt only)
              </span>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <div className="space-x-2">
              <button
                className={`px-4 py-2 rounded ${
                  selectionMode === 'word'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
                onClick={() => setSelectionMode('word')}
              >
                Word Mode
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  selectionMode === 'line'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
                onClick={() => setSelectionMode('line')}
              >
                Line Mode
              </button>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => {
                setIsFileUploaded(false);
                setPoem(null);
              }}
            >
              Upload New Poem
            </button>
          </div>
          <div className="flex-grow flex gap-4">
            <div className="w-1/2 border rounded-lg p-4 overflow-y-auto">
              <PoemDisplay />
            </div>
            <div className="w-1/2 border rounded-lg">
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