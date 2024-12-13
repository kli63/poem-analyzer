import React from 'react';
import { RhymeGroup, WordPosition } from '../types/rhyme';

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
  const formatLocations = (positions: Set<WordPosition>): string[] => {
    return Array.from(positions)
      .map(pos => {
        if (isStanzaMode) {
          return `Line ${pos.stanzaLineIndex + 1}`;
        } else {
          return `Line ${pos.lineIndex + 1}${pos.stanzaNumber ? ` (Stanza ${pos.stanzaNumber})` : ''}`;
        }
      });
  };

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
                  {group.words.size} words
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {Array.from(group.words.entries()).map(([word, positions], wordIndex) => (
                  <div
                    key={wordIndex}
                    className="group relative inline-block"
                  >
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-sm rounded">
                      {word}
                      <span className="ml-1 text-xs text-gray-500">
                        ({positions.size}x)
                      </span>
                    </span>
                    <div className="absolute left-0 z-10 hidden group-hover:block bottom-full mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded shadow-lg">
                      <div className="p-2">
                        <div className="font-semibold mb-1">Appears in:</div>
                        <div className="space-y-0.5">
                          {formatLocations(positions).map((location, i) => (
                            <div key={i}>{location}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
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