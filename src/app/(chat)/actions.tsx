import 'server-only';

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue,
} from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { customAlphabet } from 'nanoid';
import { z } from 'zod';
import { BotCard, BotMessage, SpinnerMessage, SystemMessage } from './Message';
import { Chat, Message } from './types';
import { UserMessage } from './UserMessage';

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
); // 7-character random string

async function confirmPurchase(symbol: string, price: number, amount: number) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      <p>loading...</p>
      <p className="mb-2">
        Purchasing {amount} ${symbol}...
      </p>
    </div>
  );

  const systemMessage = createStreamableUI(null);

  purchasing.update(
    <div className="inline-flex items-start gap-1 md:items-center">
      <p>loading...</p>

      <p className="mb-2">
        Purchasing {amount} ${symbol}... working on it...
      </p>
    </div>
  );

  purchasing.done(
    <div>
      <p className="mb-2">
        You have successfully purchased {amount} ${symbol}. Total cost:{' '}
        {amount * price}
      </p>
    </div>
  );

  systemMessage.done(
    <SystemMessage>
      You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
      {amount * price}.
    </SystemMessage>
  );

  aiState.done({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'system',
        content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${
          amount * price
        }]`,
      },
    ],
  });

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: nanoid(),
      display: systemMessage.value,
    },
  };
}

async function submitUserMessage(content: string) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content,
      },
    ],
  });

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>;
  let textNode: undefined | React.ReactNode;

  const result = await streamUI({
    model: openai('gpt-4o-mini'),
    initial: <SpinnerMessage />,
    system: `\
    You are an expert web developer and code quality specialist acting as a Code Review and Optimization Assistant. Your core mission is to analyze codebases, identify areas for improvement, and suggest practical, high-value optimizations that align with modern software development best practices.

    Key Responsibilities:
    1. Identify actionable improvements in code quality, design, and performance.
    2. Propose practical, easy-to-implement solutions that enhance the overall project without introducing unnecessary complexity.
    3. Prioritize suggestions based on their potential impact and ease of implementation.
    4. Provide clear, constructive feedback that educates and motivates developers.

    Areas of Expertise:
    1. Code Quality & Best Practices
    2. Performance Optimization
    3. Testing & Quality Assurance
    4. Security Best Practices
    5. Architecture & Scalability
    6. DevOps & Continuous Integration
    7. Frontend Optimization
    8. Backend Optimization
    9. Code Documentation & Readability

    When reviewing code, focus on:
    - Identifying unused variables, functions, and dead code
    - Detecting code duplication and suggesting abstractions
    - Recommending improvements in error handling and exception management
    - Suggesting performance optimizations (e.g., caching, lazy loading)
    - Analyzing test coverage and quality
    - Identifying potential security vulnerabilities
    - Providing insights on scalability and architecture
    - Suggesting improvements for frontend and backend optimization
    - Recommending enhancements for code documentation and readability

    Provide your review in the following format:
    1. Summary of critical findings and their potential impact
    2. Detailed explanations of each issue, including:
       - Problem description
       - Potential risks or drawbacks
       - Proposed solution with code examples (if applicable)
       - Expected benefits of implementing the solution
    3. Prioritized list of recommendations, considering both impact and effort required

    Remember to approach reviews with empathy, focus on practical improvements, use each review as an educational opportunity, and foster a collaborative approach to code improvement.`,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name,
      })),
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('');
        textNode = <BotMessage content={textStream.value} />;
      }

      if (done) {
        textStream.done();
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content,
            },
          ],
        });
      } else {
        textStream.update(delta);
      }

      return textNode;
    },
    tools: {
      listStocks: {
        description: 'List three imaginary stocks that are trending.',
        parameters: z.object({
          stocks: z.array(
            z.object({
              symbol: z.string().describe('The symbol of the stock'),
              price: z.number().describe('The price of the stock'),
              delta: z.number().describe('The change in price of the stock'),
            })
          ),
        }),
        generate: async function* ({ stocks }) {
          yield (
            <BotCard>
              <div className="bg-red-500">loaindg</div>
            </BotCard>
          );

          const toolCallId = nanoid();

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'listStocks',
                    toolCallId,
                    args: { stocks },
                  },
                ],
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'listStocks',
                    toolCallId,
                    result: stocks,
                  },
                ],
              },
            ],
          });

          return (
            <BotCard>
              <div className="bg-red-500">loaindg</div>
            </BotCard>
          );
        },
      },
      showStockPrice: {
        description:
          'Get the current stock price of a given stock or currency. Use this to show the price to the user.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
            ),
          price: z.number().describe('The price of the stock.'),
          delta: z.number().describe('The change in price of the stock'),
        }),
        generate: async function* ({ symbol, price, delta }) {
          yield (
            <BotCard>
              <div className="bg-red-500">loaindg</div>
            </BotCard>
          );

          const toolCallId = nanoid();

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'showStockPrice',
                    toolCallId,
                    args: { symbol, price, delta },
                  },
                ],
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'showStockPrice',
                    toolCallId,
                    result: { symbol, price, delta },
                  },
                ],
              },
            ],
          });

          return (
            <BotCard>
              <div className="bg-red-500">loaindg</div>
            </BotCard>
          );
        },
      },
      showStockPurchase: {
        description:
          'Show price and the UI to purchase a stock or currency. Use this if the user wants to purchase a stock or currency.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
            ),
          price: z.number().describe('The price of the stock.'),
          numberOfShares: z
            .number()
            .optional()
            .describe(
              'The **number of shares** for a stock or currency to purchase. Can be optional if the user did not specify it.'
            ),
        }),
        generate: async function* ({ symbol, price, numberOfShares = 100 }) {
          const toolCallId = nanoid();

          if (numberOfShares <= 0 || numberOfShares > 1000) {
            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showStockPurchase',
                      toolCallId,
                      args: { symbol, price, numberOfShares },
                    },
                  ],
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showStockPurchase',
                      toolCallId,
                      result: {
                        symbol,
                        price,
                        numberOfShares,
                        status: 'expired',
                      },
                    },
                  ],
                },
                {
                  id: nanoid(),
                  role: 'system',
                  content: `[User has selected an invalid amount]`,
                },
              ],
            });

            return <BotMessage content={'Invalid amount'} />;
          } else {
            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showStockPurchase',
                      toolCallId,
                      args: { symbol, price, numberOfShares },
                    },
                  ],
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showStockPurchase',
                      toolCallId,
                      result: {
                        symbol,
                        price,
                        numberOfShares,
                      },
                    },
                  ],
                },
              ],
            });

            return (
              <BotCard>
                <div className="bg-red-500">loaindg</div>
              </BotCard>
            );
          }
        },
      },
      getEvents: {
        description:
          'List funny imaginary events between user highlighted dates that describe stock activity.',
        parameters: z.object({
          events: z.array(
            z.object({
              date: z
                .string()
                .describe('The date of the event, in ISO-8601 format'),
              headline: z.string().describe('The headline of the event'),
              description: z.string().describe('The description of the event'),
            })
          ),
        }),
        generate: async function* ({ events }) {
          yield (
            <BotCard>
              <div className="bg-red-500">loaindg</div>
            </BotCard>
          );

          const toolCallId = nanoid();

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'getEvents',
                    toolCallId,
                    args: { events },
                  },
                ],
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'getEvents',
                    toolCallId,
                    result: events,
                  },
                ],
              },
            ],
          });

          return (
            <BotCard>
              <div className="bg-red-500">loaindg</div>
            </BotCard>
          );
        },
      },
    },
  });

  return {
    id: nanoid(),
    display: result.value,
  };
}

export type AIState = {
  chatId: string;
  messages: Message[];
  selectedFile: string | null;
};

export type UIState = {
  id: string;
  display: React.ReactNode;
}[];

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    confirmPurchase,
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [], selectedFile: null },
  onGetUIState: async () => {
    'use server';

    const aiState = getAIState() as Chat;

    if (aiState) {
      const uiState = getUIStateFromAIState(aiState);
      return uiState;
    }
  },
  onSetAIState: async ({ state, done }) => {
    'use server';

    console.log('state', state);

    if (!done) return;

    const { chatId, messages } = state;

    const createdAt = new Date();

    const path = `/chat/${chatId}`;

    const firstMessageContent = messages[0].content as string;
    const title = firstMessageContent.substring(0, 100);

    const chat: Chat = {
      id: chatId,
      title,
      userId: 'TEMP_USER_ID',
      createdAt,
      messages,
      path,
    };

    console.log('chat', chat);
  },
});

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter((message) => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map((tool) => {
            return tool.toolName === 'listStocks' ? (
              <BotCard>
                {/* TODO: Infer types based on the tool result*/}
                {/* @ts-expect-error */}
                <Stocks props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'showStockPrice' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Stock props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'showStockPurchase' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Purchase props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'getEvents' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Events props={tool.result} />
              </BotCard>
            ) : null;
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null,
    }));
};