import { openai } from '@ai-sdk/openai';
import { streamUI } from 'ai/rsc';
import { z } from 'zod';

export async function submitMessage(input: string) {
  'use server';

  const stream = await streamUI({
    model: openai('gpt-4o-mini'),
    messages: [
      { role: 'system', content: 'You are a friendly bot!' },
      { role: 'user', content: input },
    ],
    text: ({ content, done }) => {
      return <div>{content}</div>;
    },
    tools: {
      deploy: {
        description: 'Deploy repository to vercel',
        parameters: z.object({
          repositoryName: z
            .string()
            .describe('The name of the repository, example: vercel/ai-chatbot'),
        }),
        generate: async function* ({ repositoryName }) {
          yield <div>Cloning repository {repositoryName}...</div>;
          await new Promise((resolve) => setTimeout(resolve, 3000));
          yield <div>Building repository {repositoryName}...</div>;
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return <div>{repositoryName} deployed!</div>;
        },
      },
    },
  });

  return {
    ui: stream.value,
  };
}
