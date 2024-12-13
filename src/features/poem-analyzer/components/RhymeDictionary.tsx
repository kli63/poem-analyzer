import React from 'react';
import { RhymeGroup } from '../types/rhyme';

interface RhymeDictionaryProps {
    rhymeGroups: RhymeGroup[];
    isStanzaMode: boolean;
    onToggleMode: () => void;
  }
  
  const RhymeDictionary: React.FC<RhymeDictionaryProps> = ({ 
    rhymeGroups, 
    isStanzaMode,
    onToggleMode 
  }) => {
    return (
      <div className="fixed right-4 top-20 w-80 bg-white shadow-lg rounded-lg p-4 overflow-y-auto max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Rhyme Dictionary</h2>
          <button
            onClick={onToggleMode}
            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded"
          >
            {isStanzaMode ? 'Show Global' : 'Show By Stanza'}
          </button>
        </div>
        {rhymeGroups.length === 0 ? (
          <p className="text-gray-500">No rhyme groups found</p>
        ) : (
          <div className="space-y-4">
            {isStanzaMode && (
              <div className="mb-2 text-sm font-medium text-gray-500">
                Sorted by stanza, then by frequency
              </div>
            )}
            {rhymeGroups.map((group, index) => (
              <div key={index} className="border rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    {group.stanzaNumber && `Stanza ${group.stanzaNumber} - `}
                    Phoneme: {group.phonemeKey}
                  </span>
                  <span className="text-xs text-gray-500">
                    {group.frequency} words
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Array.from(group.words).map((pos, wordIndex) => (
                    <span
                      key={wordIndex}
                      className="inline-flex items-center px-2 py-1 bg-gray-100 text-sm rounded"
                    >
                      {pos.word}
                      <span className="ml-1 text-xs text-gray-500">
                        (L{pos.lineIndex + 1})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default RhymeDictionary;