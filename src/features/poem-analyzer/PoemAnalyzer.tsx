// src/features/poem-analyzer/PoemAnalyzer.tsx

import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { usePoemFile } from './hooks/usePoemFile';
import { Word, Line } from './types/poem';
import PoemAndChatContainer from './components/Canvas';
import RhymeDictionary from './components/RhymeDictionary';

interface PoemAnalyzerProps {
  className?: string;
}

const PoemAnalyzer: React.FC<PoemAnalyzerProps> = () => {
  const { poem, isFileUploaded, error, handleFileUpload, resetPoem } = usePoemFile();
  const [selectionMode, setSelectionMode] = useState<'word' | 'line'>('word');
  const [showRhymes, setShowRhymes] = useState(false);
  const [isStanzaMode, setIsStanzaMode] = useState(false);

  const handleSelection = (item: Word | Line) => {
    alert(item.getMetadata());
  };

  return (
    <div className="h-screen flex flex-col p-4">
      {!isFileUploaded ? (
        <FileUpload onFileUpload={handleFileUpload} error={error} />
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex h-10">
                <button
                  className={`px-4 rounded-l ${
                    selectionMode === 'word' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  onClick={() => setSelectionMode('word')}
                >
                  Word Mode
                </button>
                <button
                  className={`px-4 rounded-r ${
                    selectionMode === 'line' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  onClick={() => setSelectionMode('line')}
                >
                  Line Mode
                </button>
              </div>
              <button
                className={`px-4 py-2 h-10 ${
                  showRhymes 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                } rounded`}
                onClick={() => setShowRhymes(!showRhymes)}
              >
                {showRhymes ? 'Hide Rhymes' : 'Show Rhymes'}
              </button>
            </div>
            <button
              className="px-4 py-2 h-10 text-gray-500 hover:text-gray-700"
              onClick={resetPoem}
            >
              Upload New Poem
            </button>
          </div>
          <div className="flex-grow min-h-0">
            {poem && (
              <>
                <PoemAndChatContainer
                  poem={poem}
                  selectionMode={selectionMode}
                  onSelection={handleSelection}
                />
                {showRhymes && (
                  <RhymeDictionary 
                    rhymeGroups={poem.rhymeAnalyzer.getAllRhymeGroups(isStanzaMode)}
                    isStanzaMode={isStanzaMode}
                    onToggleMode={() => setIsStanzaMode(!isStanzaMode)}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PoemAnalyzer;