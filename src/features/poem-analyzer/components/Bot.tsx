import React from 'react';
import { Loader2 } from 'lucide-react';
import { Word, Line, Poem } from '../types/poem';
import { streamCompletion } from '../../../lib/openai';

interface BotProps {
  onResponse: (response: string) => void;
  onTyping: (text: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export class Bot {
  constructor(private props: BotProps) {}

  private createPrompt(poem: Poem | null, unit: Word | Line, userContext: string): string {
    const isWord = unit instanceof Word;
    const contextPrompt = userContext.trim() 
      ? `\nUser's Feedback Goals: ${userContext}`
      : '\nNo specific feedback goals provided.';

    let specificAnalysis = '';
    if (isWord) {
      const wordUnit = unit as Word;
      const rhymeInfo = wordUnit.rhymePositions ? 
        Array.from(wordUnit.rhymePositions.entries())
          .map(([word, positions]) => 
            positions.size > 0 ? `"${word}" (${Array.from(positions)
              .map(pos => `line ${pos.lineIndex + 1}, stanza ${pos.stanzaNumber}`)
              .join('; ')})` : ''
          )
          .filter(s => s)
          .join(', ') : 
        'No rhymes found';

      specificAnalysis = `
Analysis Focus: Single Word
Word: "${wordUnit.text}"
Line Context: "${wordUnit.getContext()}"
Enjambment Status: ${wordUnit.enjambmentType}
Phoneme Key: ${wordUnit.phonemeKey ?? 'None'}
Rhymes with: ${rhymeInfo}`;

      const hasRhymes = wordUnit.rhymePositions && 
        Array.from(wordUnit.rhymePositions.values()).some(positions => positions.size > 0);
      if (hasRhymes) {
        specificAnalysis += '\nInclude analysis of how this word\'s rhyme relationships contribute to the poem\'s sound patterns and meaning.';
      }
    } else {
      const line = unit as Line;
      specificAnalysis = `
Analysis Focus: Full Line
Line: "${line.toString()}"
Indentation: ${line.indentation} spaces
Enjambment Details:
${line.getWords().map(w => `- "${w.text}": ${w.enjambmentType}`).join('\n')}

Stanza Context:
${line.getContext()}`;
    }

    return `Analyzing a specific ${isWord ? 'word' : 'line'} in the following poem:

${poem?.toString()}${contextPrompt}

${specificAnalysis}

Please provide detailed feedback and analysis addressing:
1. Specific role and impact of this ${isWord ? 'word' : 'line'} in the poem's meaning
2. Technical elements: ${isWord 
    ? 'sound patterns (including rhyme relationships), word choice, connotations, relationships to surrounding words, enjambment effects if present'
    : 'rhythm, line breaks, enjambment patterns, relationship to surrounding lines'}
3. How this ${isWord ? 'word' : 'line'} contributes to the poem's themes or imagery
4. If relevant, specific suggestions for potential revisions or alternatives

Focus on providing concrete, specific feedback about this particular ${isWord ? 'word' : 'line'} rather than general observations about the poem.`;
  }

  async generateResponse(
    poem: Poem | null, 
    unit: Word | Line, 
    userContext: string,
    signal?: AbortSignal
  ) {
    const { onResponse, onTyping, setIsLoading } = this.props;
    const prompt = this.createPrompt(poem, unit, userContext);
    
    setIsLoading(true);
    try {
      let fullResponse = '';
      const stream = await streamCompletion({
        prompt,
        signal
      });

      for await (const chunk of stream) {
        if (signal?.aborted) {
          throw new Error('AbortError');
        }
        fullResponse += chunk;
        onTyping(fullResponse);
      }

      onResponse(fullResponse);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message === 'AbortError') {
        } else {
          console.error('Error generating response:', error);
          onResponse('Sorry, there was an error generating the response. Please try again.');
        }
      }
      throw error;
    } finally {
      setIsLoading(false);
      onTyping('');
    }
  }
}

export const LoadingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>Generating feedback...</span>
  </div>
);