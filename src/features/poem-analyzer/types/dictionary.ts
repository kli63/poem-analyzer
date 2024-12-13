// src/features/poem-analyzer/types/dictionary.ts

import { dictionary } from 'cmu-pronouncing-dictionary';
import { WordPosition } from './rhyme';

export type WordInstance = {
  position: WordPosition;
  lineText: string; // Store the full line for context
};

export type WordEntry = {
  word: string;
  phonemeKey: string | null;
  allPhonemes: string[];
  instances: WordInstance[];
  rhymes: Set<string>; // Set of words that rhyme with this one
  frequency: number;
};

export type WordFilter = 'articles' | 'prepositions' | 'conjunctions' | 'auxiliaryVerbs' | 'all';

export class PoemDictionary {
  private entries: Map<string, WordEntry> = new Map();
  private debug: boolean = true;

  // Common word lists for filtering
  private static readonly ARTICLES = new Set(['a', 'an', 'the']);
  private static readonly PREPOSITIONS = new Set([
    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'from', 'of',
    'over', 'under', 'between', 'through', 'after', 'before', 'during'
  ]);
  private static readonly CONJUNCTIONS = new Set([
    'and', 'but', 'or', 'nor', 'for', 'yet', 'so',
    'because', 'although', 'unless', 'since', 'while'
  ]);
  private static readonly AUXILIARY_VERBS = new Set([
    'am', 'is', 'are', 'was', 'were', 'be', 'being', 'been',
    'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could'
  ]);

  constructor(debug: boolean = true) {
    this.debug = debug;
  }

  private getPhonemeKey(word: string): string | null {
    const cleanWord = word.toLowerCase();
    const pronunciation = dictionary[cleanWord];
    
    if (!pronunciation) {
      if (this.debug) console.log(`No pronunciation found for word: ${word}`);
      return null;
    }

    const phonemes = pronunciation.split(' ');
    if (phonemes.length === 0) return null;

    if (phonemes.length === 1) return phonemes[0];
    if (phonemes.length <= 3) return phonemes.slice(-2).join(' ');
    return phonemes.slice(-3).join(' ');
  }

  private getAllPhonemes(word: string): string[] {
    const pronunciation = dictionary[word.toLowerCase()];
    return pronunciation ? pronunciation.split(' ') : [];
  }

  addWord(word: string, position: WordPosition, lineText: string): void {
    const cleanWord = word.toLowerCase();
    const instance: WordInstance = { position, lineText };
    
    if (!this.entries.has(cleanWord)) {
      this.entries.set(cleanWord, {
        word: cleanWord,
        phonemeKey: this.getPhonemeKey(cleanWord),
        allPhonemes: this.getAllPhonemes(cleanWord),
        instances: [instance],
        rhymes: new Set(),
        frequency: 1
      });
    } else {
      const entry = this.entries.get(cleanWord)!;
      entry.instances.push(instance);
      entry.frequency++;
    }
  }

  addRhyme(word1: string, word2: string): void {
    const clean1 = word1.toLowerCase();
    const clean2 = word2.toLowerCase();
    
    if (clean1 === clean2) return; // Don't add self-rhymes
    
    this.entries.get(clean1)?.rhymes.add(clean2);
    this.entries.get(clean2)?.rhymes.add(clean1);
  }

  getEntry(word: string): WordEntry | undefined {
    return this.entries.get(word.toLowerCase());
  }

  getAllEntries(filter?: WordFilter): WordEntry[] {
    let entries = Array.from(this.entries.values());
    
    if (filter) {
      entries = entries.filter(entry => {
        const word = entry.word.toLowerCase();
        switch (filter) {
          case 'articles':
            return !PoemDictionary.ARTICLES.has(word);
          case 'prepositions':
            return !PoemDictionary.PREPOSITIONS.has(word);
          case 'conjunctions':
            return !PoemDictionary.CONJUNCTIONS.has(word);
          case 'auxiliaryVerbs':
            return !PoemDictionary.AUXILIARY_VERBS.has(word);
          case 'all':
            return !PoemDictionary.ARTICLES.has(word) &&
                   !PoemDictionary.PREPOSITIONS.has(word) &&
                   !PoemDictionary.CONJUNCTIONS.has(word) &&
                   !PoemDictionary.AUXILIARY_VERBS.has(word);
          default:
            return true;
        }
      });
    }

    return entries.sort((a, b) => b.frequency - a.frequency);
  }
}