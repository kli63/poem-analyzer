// handles the analysis and tracking of rhymes in a poem, using the cmu dictionary
// for phonetic matching
import { dictionary } from 'cmu-pronouncing-dictionary';
import { Word } from './poem';

export type WordPosition = {
  lineIndex: number;        // global line index in poem
  stanzaLineIndex: number;  // line index within its stanza
  stanzaNumber: number;     // 1-based stanza number (starts at 1 not 0)
  wordIndex: number;        // position within its line
  isLineEnd: boolean;       // whether it's the last word in its line
  word: string;            // the actual text of the word
};

// maps lowercase words to all their positions
export type WordMap = Map<string, Set<WordPosition>>;

// represents a group of rhyming words
export type RhymeGroup = {
  phonemeKey: string;       // the phonetic pattern these words share
  words: WordMap;          // maps each unique word to all its positions
  frequency: number;        // how many unique words are in this group
  stanzaNumber?: number;    // only used for stanza-specific groups
};

// maps phoneme keys to word maps
export type RhymeMap = Map<string, WordMap>;
// maps stanza numbers to their rhyme maps
export type StanzaRhymeMap = Map<number, RhymeMap>;

export class RhymeAnalyzer {
  private globalRhymeMap: RhymeMap = new Map();
  private stanzaRhymeMap: StanzaRhymeMap = new Map();
  private debug: boolean = true;

  constructor(debug: boolean = true) {
    this.debug = debug;
  }

  protected getPhonemeKey(word: string): string | null {
    const cleanWord = word.toLowerCase();
    const pronunciation = dictionary[cleanWord];
    
    if (!pronunciation) {
      if (this.debug) console.log(`No pronunciation found for word: ${word}`);
      return null;
    }

    const phonemes = pronunciation.split(' ');
    if (phonemes.length === 0) return null;

    let key: string;
    if (phonemes.length === 1) {
      key = phonemes[0];
    } else if (phonemes.length <= 3) {
      key = phonemes.slice(-2).join(' ');
    } else {
      key = phonemes.slice(-3).join(' ');
    }

    return key;
  }

  addWord(wordObj: Word, position: WordPosition): void {
    const key = this.getPhonemeKey(wordObj.text);
    wordObj.phonemeKey = key;
    if (!key) return;

    const cleanWord = wordObj.text.toLowerCase();

    // add to global rhyme map
    if (!this.globalRhymeMap.has(key)) {
      this.globalRhymeMap.set(key, new Map());
    }
    const wordMap = this.globalRhymeMap.get(key)!;
    if (!wordMap.has(cleanWord)) {
      wordMap.set(cleanWord, new Set());
    }
    wordMap.get(cleanWord)!.add(position);

    // add to stanza-specific map
    if (!this.stanzaRhymeMap.has(position.stanzaNumber)) {
      this.stanzaRhymeMap.set(position.stanzaNumber, new Map());
    }
    const stanzaMap = this.stanzaRhymeMap.get(position.stanzaNumber)!;
    if (!stanzaMap.has(key)) {
      stanzaMap.set(key, new Map());
    }
    const stanzaWordMap = stanzaMap.get(key)!;
    if (!stanzaWordMap.has(cleanWord)) {
      stanzaWordMap.set(cleanWord, new Set());
    }
    stanzaWordMap.get(cleanWord)!.add(position);
  }

  findRhymes(word: string, stanzaNumber?: number): WordMap | null {
    const key = this.getPhonemeKey(word);
    if (!key) return null;
    
    const cleanWord = word.toLowerCase();
    if (stanzaNumber !== undefined) {
      const stanzaMap = this.stanzaRhymeMap.get(stanzaNumber);
      if (!stanzaMap) return null;
      
      const wordMap = stanzaMap.get(key);
      if (!wordMap) return null;
      
      // filter out the input word
      const rhymeMap = new Map(
        Array.from(wordMap.entries())
          .filter(([w]) => w !== cleanWord)
      );
      return rhymeMap.size > 0 ? rhymeMap : null;
    }
    
    const wordMap = this.globalRhymeMap.get(key);
    if (!wordMap) return null;
    
    // filter out the input word
    const rhymeMap = new Map(
      Array.from(wordMap.entries())
        .filter(([w]) => w !== cleanWord)
    );
    return rhymeMap.size > 0 ? rhymeMap : null;
  }

  getAllRhymeGroups(stanzaSpecific: boolean = false): RhymeGroup[] {
    if (!stanzaSpecific) {
      return this.getGlobalRhymeGroups();
    }
    return this.getStanzaRhymeGroups();
  }

  private getGlobalRhymeGroups(): RhymeGroup[] {
    const groups: RhymeGroup[] = [];
    
    this.globalRhymeMap.forEach((wordMap, phonemeKey) => {
      if (wordMap.size > 1) {
        groups.push({
          phonemeKey,
          words: wordMap,
          frequency: wordMap.size
        });
      }
    });

    return groups.sort((a, b) => b.frequency - a.frequency);
  }

  private getStanzaRhymeGroups(): RhymeGroup[] {
    const groups: RhymeGroup[] = [];
    
    this.stanzaRhymeMap.forEach((stanzaMap, stanzaNumber) => {
      stanzaMap.forEach((wordMap, phonemeKey) => {
        if (wordMap.size > 1) {
          groups.push({
            phonemeKey,
            words: wordMap,
            frequency: wordMap.size,
            stanzaNumber
          });
        }
      });
    });

    return groups.sort((a, b) => 
      a.stanzaNumber! !== b.stanzaNumber! ? 
        a.stanzaNumber! - b.stanzaNumber! : 
        b.frequency - a.frequency
    );
  }
}