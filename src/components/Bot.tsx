// src/components/Bot.tsx

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Word, Line, Poem } from '../types/poem';
import { streamCompletion } from '../lib/openai';

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
      const word = unit as Word;
      specificAnalysis = `
Analysis Focus: Single Word
Word: "${word.text}"
Line Context: "${word.getContext()}"
Enjambment Status: ${word.enjambmentType}`;
    } else {
      const line = unit as Line;
      specificAnalysis = `
Analysis Focus: Full Line
Line: "${line.toString()}"
Indentation: ${line.indentation} spaces
Enjambment Details:
${line.getWords().map(word => `- "${word.text}": ${word.enjambmentType}`).join('\n')}

Stanza Context:
${line.getContext()}`;
    }

    return `Analyzing a specific ${isWord ? 'word' : 'line'} in the following poem:

${poem?.toString()}${contextPrompt}

${specificAnalysis}

Please provide detailed feedback and analysis addressing:
1. Specific role and impact of this ${isWord ? 'word' : 'line'} in the poem's meaning
2. Technical elements: ${isWord 
    ? 'word choice, connotations, relationships to surrounding words, enjambment effects if present'
    : 'rhythm, line breaks, enjambment patterns, relationship to surrounding lines'}
3. How this ${isWord ? 'word' : 'line'} contributes to the poem's themes or imagery
4. If relevant, specific suggestions for potential revisions or alternatives

Focus on providing concrete, specific feedback about this particular ${isWord ? 'word' : 'line'} rather than general observations about the poem.`;
  }

  async generateResponse(poem: Poem | null, unit: Word | Line, userContext: string) {
    const { onResponse, onTyping, setIsLoading } = this.props;
    const prompt = this.createPrompt(poem, unit, userContext);
    
    setIsLoading(true);
    try {
      let fullResponse = '';
      const stream = streamCompletion(prompt);

      for await (const chunk of stream) {
        fullResponse += chunk;
        onTyping(fullResponse);
      }

      onResponse(fullResponse);
    } catch (error) {
      console.error('Error generating response:', error);
      onResponse('Sorry, there was an error generating the response. Please try again.');
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