import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'your-api-key-here',
  dangerouslyAllowBrowser: true
});
interface StreamCompletionOptions {
  prompt: string;
  signal?: AbortSignal;
}

export async function* streamCompletion({ prompt, signal }: StreamCompletionOptions) {
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY === 'your-api-key-here') {
    console.error('No OpenAI API key detected. Please provide a valid API key.');
    yield 'No OpenAI API key detected. Please provide a valid API key.';
    return;
  }

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      if (signal?.aborted) {
        throw new Error('AbortError');
      }
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error; // Re-throw abort errors
    }
    console.error('Error in OpenAI stream:', error);
    yield 'Error generating response. Please try again.';
  }
}