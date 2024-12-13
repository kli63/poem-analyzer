// src/features/poem-analyzer/types/poem.ts

import { RhymeAnalyzer, WordPosition } from './rhyme';

// defines the different types of line breaks in poetry - whether a line continues
// into the next one (enjambment) or stands alone
export enum EnjambmentType {
  NONE = 'None',
  END_OF_LINE = 'End of enjambed line',
  START_OF_LINE = 'Start of enjambed line'
}

// represents a single word in a poem, tracking its position and relationships
export class Word {
  private parentLine: Line | null = null;
  public enjambmentType: EnjambmentType = EnjambmentType.NONE;
  public rhymePositions: Map<string, Set<WordPosition>> | null = null;
  public phonemeKey: string | null = null;
  public lineIndex: number = -1; 
  public stanzaLineIndex: number = -1;
  public stanzaNumber: number = -1;

  constructor(
    public text: string,
    public isEnjambed: boolean = false
  ) {}

  // links this word to its containing line for context
  setParentLine(line: Line) {
    this.parentLine = line;
  }

  // updates the position tracking for where this word appears in the poem
  setPositions(lineIndex: number, stanzaLineIndex: number, stanzaNumber: number) {
    this.lineIndex = lineIndex;
    this.stanzaLineIndex = stanzaLineIndex;
    this.stanzaNumber = stanzaNumber;
  }

  // gets the full line this word appears in
  getContext(): string {
    return this.parentLine ? this.parentLine.toString() : '';
  }

  // formats all the metadata about this word into a readable string
  getMetadata(): string {
    const parts = [
      `Word: "${this.text}"`,
      `Position: Line ${this.lineIndex + 1} overall, Line ${this.stanzaLineIndex + 1} in Stanza ${this.stanzaNumber}`,
      `Line Context: "${this.getContext()}"`,
      `Enjambment Status: ${this.enjambmentType}`,
      `Phoneme Key: ${this.phonemeKey ?? 'None'}`,
      `Rhymes with: ${this.rhymePositions ? 
        Array.from(this.rhymePositions.entries()).map(([word, positions]) => 
          positions.size > 0 ? `"${word}" (${Array.from(positions).map(pos => 
            `line ${pos.lineIndex + 1}, stanza ${pos.stanzaNumber}`
          ).join('; ')})` : ''
        ).filter(s => s).join(', ') : 
        'No rhymes found'}`
    ];
    return parts.join('\n');
  }


  toString(): string {
    return this.text;
  }
}

// handles punctuation marks in the poem (periods, commas, etc)
export class Punctuation {
  constructor(
    public mark: string
  ) {}

  toString(): string {
    return this.mark;
  }
}

// tracks spaces and tabs in the poem to preserve formatting
export class Whitespace {
  constructor(
    public spaces: number,
    public isTab: boolean = false
  ) {}

  toString(): string {
    return ' '.repeat(this.spaces);
  }
}

// types of elements that can appear in a line
export type LineElement = Word | Punctuation | Whitespace;

// represents a single line in the poem, tracking its elements and formatting
export class Line {
  private parentStanza: Stanza | null = null;

  constructor(
    public elements: LineElement[],
    public indentation: number = 0,
    public trailingSpaces: number = 0,
    public isEnjambed: boolean = false
  ) {
    elements.forEach(element => {
      if (element instanceof Word) {
        element.setParentLine(this);
      }
    });
  }

  // links this line to its containing stanza
  setParentStanza(stanza: Stanza) {
    this.parentStanza = stanza;
  }

  // gets the full stanza this line appears in
  getContext(): string {
    return this.parentStanza ? this.parentStanza.toString() : '';
  }

  // formats the metadata about this line into a readable string
  getMetadata(): string {
    const parts = [
      `Line: "${this.toString()}"`,
      `Indentation: ${this.indentation} spaces`,
      `Enjambed: ${this.isEnjambed ? 'Yes' : 'No'}`,
      'Words:',
      ...this.getWords().map(word => 
        `  - "${word.text}" (${word.enjambmentType})`
      ),
      '\nStanza Context:',
      this.getContext()
    ];
    return parts.join('\n');
  }

  // converts the line back to a string, preserving spacing
  toString(): string {
    const indentation = ' '.repeat(this.indentation);
    const lineText = this.elements.map(element => element.toString()).join('');
    const trailing = ' '.repeat(this.trailingSpaces);
    return `${indentation}${lineText}${trailing}`;
  }

  // gets just the words from this line, filtering out spaces and punctuation
  getWords(): Word[] {
    return this.elements.filter((element): element is Word => element instanceof Word);
  }
}

// represents a group of lines in the poem (a verse/stanza)
export class Stanza {
  constructor(
    public lines: Line[],
    public spacingAfter: number = 1
  ) {
    lines.forEach(line => line.setParentStanza(this));
  }

  toString(): string {
    return this.lines.map(line => line.toString()).join('\n');
  }
}

// main class representing the entire poem and its analysis
export class Poem {
  public stanzas: Stanza[] = [];
  public rhymeAnalyzer: RhymeAnalyzer = new RhymeAnalyzer();
  private totalLines: number = 0;

  constructor(
    public title?: string,
    public author?: string
  ) {}

  // adds a new stanza to the poem
  addStanza(stanza: Stanza): void {
    this.stanzas.push(stanza);
  }

  // analyzes the rhyming patterns throughout the poem
  analyzeRhymes(): void {
    let globalLineIndex = 0;

    // first pass: build rhyme map
    this.stanzas.forEach((stanza, stanzaIndex) => {
      stanza.lines.forEach((line, stanzaLineIndex) => {
        const words = line.getWords();
        words.forEach((word, wordIndex) => {
          // set position information for the word
          word.setPositions(globalLineIndex, stanzaLineIndex, stanzaIndex + 1);

          const position: WordPosition = {
            lineIndex: globalLineIndex,
            stanzaLineIndex: stanzaLineIndex,
            stanzaNumber: stanzaIndex + 1,
            wordIndex: wordIndex,
            isLineEnd: wordIndex === words.length - 1,
            word: word.text
          };
          this.rhymeAnalyzer.addWord(word, position);
        });
        globalLineIndex++;
      });
    });

    // second pass: analyze rhymes
    this.stanzas.forEach(stanza => {
      stanza.lines.forEach(line => {
        const words = line.getWords();
        words.forEach(word => {
          word.rhymePositions = this.rhymeAnalyzer.findRhymes(word.text);
        });
      });
    });

    this.totalLines = globalLineIndex;
  }

  // figures out the rhyme scheme of the poem (ABAB or AABB, etc.)
  getRhymeScheme(): string[] {
    const scheme: string[] = [];
    let nextLabel = 'A';
    const rhymeLabels = new Map<string, string>();
  
    this.stanzas.forEach(stanza => {
      stanza.lines.forEach(line => {
        const words = line.getWords();
        if (words.length === 0) {
          scheme.push('');
          return;
        }
  
        const lastWord = words[words.length - 1];
        const tempAnalyzer = new RhymeAnalyzer();
        const key = tempAnalyzer['getPhonemeKey'](lastWord.text);
        
        if (!key) {
          scheme.push('X');
          return;
        }
  
        if (!rhymeLabels.has(key)) {
          rhymeLabels.set(key, nextLabel);
          nextLabel = String.fromCharCode(nextLabel.charCodeAt(0) + 1);
        }
  
        scheme.push(rhymeLabels.get(key) || 'X');
      });
    });
  
    return scheme;
  }
  
}

// parses a text string into a structured poem object
export function parsePoemFromText(text: string, title?: string, author?: string): Poem {
  const poem = new Poem(title, author);
  const stanzaTexts = text.trim().split(/\n\s*\n/);

  stanzaTexts.forEach((stanzaText) => {
    const lineTexts = stanzaText.split('\n');
    const lines: Line[] = [];

    lineTexts.forEach((lineText, lineIndex) => {
      // figure out the indentation at the start of the line
      const indentMatch = lineText.match(/^[\t ]*/) ?? [''];
      let indentation = 0;
      for (const char of indentMatch[0]) {
        indentation += char === '\t' ? 4 : 1;
      }
      
      const trimmedLine = lineText.slice(indentMatch[0].length);
      const elements: LineElement[] = [];
      
      // regex that handles words with hyphens and different types of apostrophes
      const tokenRegex = /([a-zA-Z]+(?:[-''][a-zA-Z]+)*)|([^\w\s'])|(\s+)/g;
      let match: RegExpExecArray | null;

      while ((match = tokenRegex.exec(trimmedLine)) !== null) {
        const [, word, punctuation, spaces] = match;

        if (word) {
          elements.push(new Word(word));
        } else if (punctuation) {
          elements.push(new Punctuation(punctuation));
        } else if (spaces) {
          let spaceCount = 0;
          let isTab = false;
          for (const char of spaces) {
            if (char === '\t') {
              spaceCount += 4;
              isTab = true;
            } else {
              spaceCount += 1;
            }
          }
          if (spaceCount > 1 || isTab) {
            elements.push(new Whitespace(spaceCount, isTab));
          } else {
            elements.push(new Whitespace(1, false));
          }
        }
      }

      // check if the line ends with punctuation to determine enjambment
      const endsWithPunctuation = /[.!?]$/.test(lineText.trim());
      const isEnjambed = !endsWithPunctuation && lineIndex < lineTexts.length - 1;
      
      lines.push(new Line(elements, indentation, 0, isEnjambed));
    });

    // handle enjambment relationships
    lines.forEach((line, lineIndex) => {
      if (line.isEnjambed && lineIndex < lines.length - 1) {
        const currentLineWords = line.getWords();
        const nextLineWords = lines[lineIndex + 1].getWords();

        if (currentLineWords.length > 0) {
          const lastWord = currentLineWords[currentLineWords.length - 1];
          lastWord.enjambmentType = EnjambmentType.END_OF_LINE;
        }

        if (nextLineWords.length > 0) {
          const firstWord = nextLineWords[0];
          firstWord.enjambmentType = EnjambmentType.START_OF_LINE;
        }
      }
    });

    poem.addStanza(new Stanza(lines));
  });

  // analyze rhymes after parsing
  poem.analyzeRhymes();
  
  return poem;
}