// src/features/poem-analyzer/components/Canvas.tsx

import React, { useState, useRef, useEffect, RefObject } from 'react';
import PoemDisplay from './PoemDisplay';
import ChatInterface from './ChatInterface';
import  { ChatInterfaceHandle } from './ChatInterface';
import { Poem, Word, Line } from '../types/poem';

interface PoemAndChatContainerProps {
  poem: Poem;
  selectionMode: 'word' | 'line';
  onSelection: (item: Word | Line) => void;
  chatInterfaceRef: RefObject<ChatInterfaceHandle | null>;
}

const PoemAndChatContainer: React.FC<PoemAndChatContainerProps> = ({
  poem,
  selectionMode,
  onSelection,
  chatInterfaceRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState<number>(50);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        e.preventDefault();
        const containerRect = containerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - containerRect.left;
        const newLeftWidth = (relativeX / containerRect.width) * 100;
        if (newLeftWidth > 10 && newLeftWidth < 90) {
          setLeftWidth(newLeftWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const startDragging = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    document.body.style.userSelect = 'none';
  };

  const handleSelection = (item: Word | Line) => {
    onSelection(item);
    chatInterfaceRef.current?.handleUserSelection(item);
  };

  const borderColor = '#ccc';

  return (
    <div 
      ref={containerRef} 
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        userSelect: 'none',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      <div 
        style={{
          width: `${leftWidth}%`,
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: '0' 
        }}
        draggable="false"
      >
        <div style={{
          border: `1px solid ${borderColor}`,
          borderRadius: '4px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <PoemDisplay 
            poem={poem}
            selectionMode={selectionMode}
            onSelection={handleSelection} 
            containerWidthPercent={leftWidth} 
          />
        </div>
      </div>

      <div 
        style={{
          width: '0px',
          background: borderColor,
          cursor: 'ew-resize',
          zIndex: 10
        }}
        onMouseDown={startDragging}
        draggable="false"
      />

      <div 
        style={{
          flexGrow: 1,
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: '0'
        }}
        draggable="false"
      >
        <div style={{
          border: `1px solid ${borderColor}`,
          borderRadius: '4px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <ChatInterface 
            poem={poem}
            containerWidthPercent={100 - leftWidth}
            ref={chatInterfaceRef}
          />
        </div>
      </div>
    </div>
  );
};

export default PoemAndChatContainer;