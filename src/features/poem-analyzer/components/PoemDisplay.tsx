// src/features/poem-analyzer/components/PoemDisplay.tsx

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Line, Word, Stanza, LineElement, Poem, Whitespace, Punctuation } from '../types/poem';

interface PoemDisplayProps {
  poem: Poem;
  selectionMode: 'word' | 'line';
  onSelection: (item: Word | Line) => void;
  containerWidthPercent: number;
}

const PoemDisplay: React.FC<PoemDisplayProps> = ({
    poem,
    selectionMode,
    onSelection,
    containerWidthPercent
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [fontSize, setFontSize] = useState<number>(12);
    const [originalFontSize, setOriginalFontSize] = useState<number>(12);

    const tryFitFontSize = useCallback((desiredSize: number) => {
      if (!containerRef.current) return desiredSize;
      let fittedSize = 6;
      for (let testSize = desiredSize; testSize >= 6; testSize--) {
        containerRef.current.style.fontSize = `${testSize}px`;
        const scrollWidth = containerRef.current.scrollWidth;
        const clientWidth = containerRef.current.clientWidth;
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

    const renderElement = (element: LineElement, elementIndex: number) => {
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
      } else if (element instanceof Whitespace) {
        return <pre key={elementIndex} className="inline m-0 p-0">{element.toString()}</pre>;
      } else if (element instanceof Punctuation) {
        return <span key={elementIndex}>{element.toString()}</span>;
      }
      return null;
    };

    return (
      <div className="flex flex-col h-full p-2" style={{height: '100%', boxSizing: 'border-box'}}>
        <div className="flex justify-end items-center gap-1 mb-2">
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
          ref={containerRef} 
          className="whitespace-pre overflow-auto flex-grow" 
          style={{ fontSize: `${fontSize}px`, boxSizing: 'border-box' }}
        >
          {poem.title && <div className="text-center mb-4">{poem.title}</div>}
          {poem.author && <div className="text-center mb-6">by {poem.author}</div>}
          {poem.stanzas.map((stanza: Stanza, stanzaIndex: number) => (
            <div 
              key={stanzaIndex} 
              className="mb-8"
              style={{ marginBottom: `${stanza.spacingAfter * 1.5}em` }}
            >
              {stanza.lines.map((line: Line, lineIndex: number) => (
                <div
                  key={`${stanzaIndex}-${lineIndex}`}
                  className={`${selectionMode === 'line' ? 'cursor-pointer hover:bg-blue-100' : ''}`}
                  onClick={() => selectionMode === 'line' && onSelection(line)}
                >
                  <div 
                    className="line-content"
                    style={{ 
                      paddingLeft: `${line.indentation}ch`,
                      display: 'block', 
                      width: '100%',
                      marginBottom: line.isEnjambed ? '0' : '0.5em'
                    }}
                  >
                    {line.elements.map(renderElement)}
                    {line.trailingSpaces > 0 && (
                      <pre className="inline m-0 p-0">{' '.repeat(line.trailingSpaces)}</pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
};

export default PoemDisplay;
