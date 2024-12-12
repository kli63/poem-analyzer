import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'your-api-key-here',
  dangerouslyAllowBrowser: true
});

export async function* streamCompletion(prompt: string) {
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY === 'your-api-key-here') {
    console.error('No OpenAI API key detected. Please provide a valid API key.');
    yield 'No OpenAI API key detected. Please provide a valid API key.';
    return;
  }

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('Error in OpenAI stream:', error);
    yield 'Error generating response. Please try again.';
  }
}
