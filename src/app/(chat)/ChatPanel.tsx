import * as React from 'react';

import { useAIState, useActions, useUIState } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { UserMessage } from './Message';
import { AI } from './actions';
import { ButtonScrollToBottom } from './ButtonScrollToBottom';
import { PromptForm } from './PromtForm';

export interface ChatPanelProps {
  id?: string;
  title?: string;
  input: string;
  setInput: (value: string) => void;
  isAtBottom: boolean;
  scrollToBottom: () => void;
}

export function ChatPanel({
  id,
  title,
  input,
  setInput,
  isAtBottom,
  scrollToBottom,
}: ChatPanelProps) {
  const [aiState] = useAIState();
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions();
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);

  const exampleMessages = [
    // {
    //   heading: 'What are the',
    //   subheading: 'trending memecoins today?',
    //   message: `What are the trending memecoins today?`,
    // },
    // {
    //   heading: 'What is the price of',
    //   subheading: '$DOGE right now?',
    //   message: 'What is the price of $DOGE right now?',
    // },
    {
      heading: 'Performance improvements',
      subheading: 'Analyze the file for performance improvements',
      message: `Analyze the file for performance improvements`,
    },
    {
      heading: 'Security issues',
      subheading: `Check for security issues`,
      message: `Check for security issues`,
    },
  ];

  return (
    <div className="w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80">
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />

      <div className="">
        <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
          {messages.length === 0 &&
            exampleMessages.map((example, index) => (
              <div
                key={example.heading}
                className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                  index > 1 && 'hidden md:block'
                }`}
                onClick={async () => {
                  setMessages((currentMessages) => [
                    ...currentMessages,
                    {
                      id: nanoid(),
                      display: <UserMessage>{example.message}</UserMessage>,
                    },
                  ]);

                  const responseMessage = await submitUserMessage(
                    example.message
                  );

                  setMessages((currentMessages) => [
                    ...currentMessages,
                    responseMessage,
                  ]);
                }}
              >
                <div className="text-sm font-semibold">{example.heading}</div>
                <div className="text-sm text-zinc-600">
                  {example.subheading}
                </div>
              </div>
            ))}
        </div>

        <div className="sticky bottom-0">
          <PromptForm input={input} setInput={setInput} />
        </div>
      </div>
    </div>
  );
}
