import { dictionary } from 'cmu-pronouncing-dictionary';
import { Word } from './poem';

export type WordPosition = {
  lineIndex: number;        // Global line index in poem
  stanzaLineIndex: number;  // Line index within stanza
  stanzaNumber: number;     // 1-based stanza number
  wordIndex: number;
  isLineEnd: boolean;
  word: string;
};

export type RhymeGroup = {
  phonemeKey: string;
  words: Set<WordPosition>;
  frequency: number;
  stanzaNumber?: number;    // Only present for stanza-specific groups
};

export type RhymeMap = Map<string, Set<WordPosition>>;
export type StanzaRhymeMap = Map<number, Map<string, Set<WordPosition>>>;

export class RhymeAnalyzer {
  private globalRhymeMap: RhymeMap = new Map();
  private stanzaRhymeMap: StanzaRhymeMap = new Map();
  private addedWords: Map<string, Set<string>> = new Map(); // phonemeKey -> Set of unique words
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

  private shouldAddWord(word: string, phonemeKey: string): boolean {
    const cleanWord = word.toLowerCase();
    if (!this.addedWords.has(phonemeKey)) {
      this.addedWords.set(phonemeKey, new Set([cleanWord]));
      return true;
    }

    const wordsInGroup = this.addedWords.get(phonemeKey)!;
    if (wordsInGroup.has(cleanWord)) {
      return false;
    }

    wordsInGroup.add(cleanWord);
    return true;
  }

  addWord(wordObj: Word, position: WordPosition): void {
    const key = this.getPhonemeKey(wordObj.text);
    wordObj.phonemeKey = key;
    
    if (!key || !this.shouldAddWord(wordObj.text, key)) return;

    // Add to global rhyme map
    if (!this.globalRhymeMap.has(key)) {
      this.globalRhymeMap.set(key, new Set());
    }
    this.globalRhymeMap.get(key)?.add(position);

    // Add to stanza-specific rhyme map
    if (!this.stanzaRhymeMap.has(position.stanzaNumber)) {
      this.stanzaRhymeMap.set(position.stanzaNumber, new Map());
    }
    const stanzaMap = this.stanzaRhymeMap.get(position.stanzaNumber)!;
    if (!stanzaMap.has(key)) {
      stanzaMap.set(key, new Set());
    }
    stanzaMap.get(key)?.add(position);
  }

  findRhymes(word: string, stanzaNumber?: number): Set<WordPosition> | null {
    const key = this.getPhonemeKey(word);
    if (!key) return null;
    
    const cleanWord = word.toLowerCase();
    if (stanzaNumber !== undefined) {
      const stanzaMap = this.stanzaRhymeMap.get(stanzaNumber);
      if (!stanzaMap) return null;
      
      const rhymes = stanzaMap.get(key);
      if (!rhymes) return null;
      
      return new Set(Array.from(rhymes)
        .filter(pos => pos.word.toLowerCase() !== cleanWord));
    }
    
    const rhymes = this.globalRhymeMap.get(key);
    if (!rhymes) return null;
    
    return new Set(Array.from(rhymes)
      .filter(pos => pos.word.toLowerCase() !== cleanWord));
  }

  getAllRhymeGroups(stanzaSpecific: boolean = false): RhymeGroup[] {
    if (!stanzaSpecific) {
      return this.getGlobalRhymeGroups();
    }
    return this.getStanzaRhymeGroups();
  }

  private getGlobalRhymeGroups(): RhymeGroup[] {
    const groups: RhymeGroup[] = [];
    
    this.globalRhymeMap.forEach((words, phonemeKey) => {
      const uniqueWords = new Set(Array.from(words).map(w => w.word.toLowerCase()));
      if (uniqueWords.size > 1) {
        groups.push({
          phonemeKey,
          words,
          frequency: uniqueWords.size
        });
      }
    });

    return groups.sort((a, b) => b.frequency - a.frequency);
  }

  private getStanzaRhymeGroups(): RhymeGroup[] {
    const groups: RhymeGroup[] = [];
    
    this.stanzaRhymeMap.forEach((stanzaMap, stanzaNumber) => {
      stanzaMap.forEach((words, phonemeKey) => {
        const uniqueWords = new Set(Array.from(words).map(w => w.word.toLowerCase()));
        if (uniqueWords.size > 1) {
          groups.push({
            phonemeKey,
            words,
            frequency: uniqueWords.size,
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