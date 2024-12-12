// src/features/poem-analyzer/components/PoemDisplay.tsx
import React, { useRef, useEffect, useState } from 'react';
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
  const [fontSize, setFontSize] = useState<number>(16);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
  
    const adjustFontSize = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const containerWidth = container.clientWidth;
      const minSize = 8;
      const maxSize = 24;
  
      let min = minSize;
      let max = maxSize;
  
      while (min <= max) {
        const testSize = Math.floor((min + max) / 2);
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

  return (
    <div ref={containerRef} style={{ fontSize: `${fontSize}px` }} className="whitespace-pre">
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
  );
};