// src/types/poem.ts

export enum EnjambmentType {
  NONE = 'None',
  END_OF_LINE = 'End of enjambed line',
  START_OF_LINE = 'Start of enjambed line'
}

export class Word {
  private parentLine: Line | null = null;
  public enjambmentType: EnjambmentType = EnjambmentType.NONE;

  constructor(
    public text: string,
    public isEnjambed: boolean = false
  ) {}

  setParentLine(line: Line) {
    this.parentLine = line;
  }

  getContext(): string {
    return this.parentLine ? this.parentLine.toString() : '';
  }

  getMetadata(): string {
    const parts = [
      `Word: "${this.text}"`,
      `Line Context: "${this.getContext()}"`,
      `Enjambment Status: ${this.enjambmentType}`
    ];
    return parts.join('\n');
  }

  toString(): string {
    return this.text;
  }
}

export class Punctuation {
  constructor(
    public mark: string
  ) {}

  toString(): string {
    return this.mark;
  }
}

export class Whitespace {
  constructor(
    public spaces: number,
    public isTab: boolean = false
  ) {}

  toString(): string {
    return ' '.repeat(this.spaces);
  }
}

export type LineElement = Word | Punctuation | Whitespace;

export class Line {
  private parentStanza: Stanza | null = null;

  constructor(
    public elements: LineElement[],
    public indentation: number = 0,
    public trailingSpaces: number = 0,
    public isEnjambed: boolean = false
  ) {
    // Set parent line reference for all words
    elements.forEach(element => {
      if (element instanceof Word) {
        element.setParentLine(this);
      }
    });
  }

  setParentStanza(stanza: Stanza) {
    this.parentStanza = stanza;
  }

  getContext(): string {
    return this.parentStanza ? this.parentStanza.toString() : '';
  }

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

  toString(): string {
    const indentation = ' '.repeat(this.indentation);
    const lineText = this.elements.map(element => element.toString()).join('');
    const trailing = ' '.repeat(this.trailingSpaces);
    return `${indentation}${lineText}${trailing}`;
  }

  getWords(): Word[] {
    return this.elements.filter((element): element is Word => element instanceof Word);
  }
}

export class Stanza {
  constructor(
    public lines: Line[],
    public spacingAfter: number = 1
  ) {
    // Set parent stanza reference for all lines
    lines.forEach(line => line.setParentStanza(this));
  }

  toString(): string {
    return this.lines.map(line => line.toString()).join('\n');
  }
}

export class Poem {
  public stanzas: Stanza[] = [];

  constructor(
    public title?: string,
    public author?: string
  ) {}

  addStanza(stanza: Stanza): void {
    this.stanzas.push(stanza);
  }

  toString(): string {
    let poemText = '';
    if (this.title) poemText += `${this.title}\n\n`;
    if (this.author) poemText += `by ${this.author}\n\n`;
    poemText += this.stanzas.map(stanza => stanza.toString()).join('\n\n');
    return poemText.trim();
  }
}

export function parsePoemFromText(text: string, title?: string, author?: string): Poem {
  const poem = new Poem(title, author);
  const stanzaTexts = text.trim().split(/\n\s*\n/);

  stanzaTexts.forEach((stanzaText) => {
    const lineTexts = stanzaText.split('\n');
    const lines: Line[] = [];

    lineTexts.forEach((lineText, lineIndex) => {
      const indentMatch = lineText.match(/^[\t ]*/) ?? [''];
      let indentation = 0;
      for (const char of indentMatch[0]) {
        indentation += char === '\t' ? 4 : 1;
      }
      
      const trimmedLine = lineText.slice(indentMatch[0].length);
      const elements: LineElement[] = [];
      
      const tokenRegex = /([a-zA-Z]+(?:[-''][a-zA-Z]+)*)|([^\w\s])|(\s+)/g;
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

      const endsWithPunctuation = /[.!?]$/.test(lineText.trim());
      const isEnjambed = !endsWithPunctuation && lineIndex < lineTexts.length - 1;
      
      lines.push(new Line(elements, indentation, 0, isEnjambed));
    });

    // Handle enjambment relationships
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

  return poem;
}