// src/features/poem-analyzer/components/PoemDisplay.tsx

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Line, Word, Stanza, LineElement, Poem } from '../types/poem';

interface PoemDisplayProps {
  poem: Poem;
  selectionMode: 'word' | 'line';
  onSelection: (item: Word | Line) => void;
}

export const PoemDisplay: React.FC<PoemDisplayProps> = ({
    poem,
    selectionMode,
    onSelection
  }) => {
    const [fontSize, setFontSize] = useState<number>(12);
    const containerRef = useRef<HTMLDivElement>(null);
  
    const adjustFontSizeToFitContent = useCallback(() => {
      if (!containerRef.current) return;
      const maxHeight = containerRef.current.clientHeight;
      let optimalSize = fontSize;
  
      for (let testSize = 18; testSize >= 12; testSize--) {
        containerRef.current.style.fontSize = `${testSize}px`;
        if (containerRef.current.scrollHeight <= maxHeight) {
          optimalSize = testSize;
          break;
        }
      }
      containerRef.current.style.fontSize = `${optimalSize}px`;
      setFontSize(optimalSize);
    }, [fontSize]);
  
    useEffect(() => {
      adjustFontSizeToFitContent();
      window.addEventListener('resize', adjustFontSizeToFitContent);
      return () => window.removeEventListener('resize', adjustFontSizeToFitContent);
    }, [adjustFontSizeToFitContent, poem]);

  const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    if (!isNaN(newSize) && newSize >= 6 && newSize <= 48) {
      setFontSize(newSize);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (isNaN(value)) {
      setFontSize(12);
    } else {
      setFontSize(Math.max(6, Math.min(48, value)));
    }
  };

  return (
    <div className="flex flex-col h-full p-2">
      <div className="flex justify-end items-center gap-1 mb-2">
        <button 
          onClick={() => setFontSize(Math.max(6, fontSize - 1))} 
          disabled={fontSize <= 6} 
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
          onClick={() => setFontSize(Math.min(48, fontSize + 1))} 
          disabled={fontSize >= 48} 
          className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          +
        </button>
      </div>
      <div 
        ref={containerRef} 
        className="whitespace-pre overflow-auto flex-grow" 
        style={{ fontSize: `${fontSize}px` }}
      >
        {poem.stanzas.map((stanza: Stanza, stanzaIndex: number) => (
          <div key={stanzaIndex} className="mb-8">
            {stanza.lines.map((line: Line, lineIndex: number) => (
              <div
                key={`${stanzaIndex}-${lineIndex}`}
                className={selectionMode === 'line' ? 'cursor-pointer hover:bg-blue-100' : ''}
                onClick={() => selectionMode === 'line' && onSelection(line)}
              >
                <div 
                  className="line-content"
                  style={{ paddingLeft: '1em', display: 'block', width: '100%' }}
                >
                  {line.elements.map((element: LineElement, elementIndex: number) => {
                    if (element instanceof Word) {
                      return (
                        <span
                          key={elementIndex}
                          onClick={(e) => {
                            if (selectionMode === 'word') {
                              e.stopPropagation();
                              onSelection(element);
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
    </div>
  );
};
