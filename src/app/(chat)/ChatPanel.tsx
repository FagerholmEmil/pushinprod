import * as React from 'react';

import { useAIState, useActions, useUIState } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { UserMessage } from './Message';
import { AI } from './actions';
import { ButtonScrollToBottom } from './ButtonScrollToBottom';
import { PromptForm } from './PromtForm';
import { atom, useAtom } from 'jotai';

export const selectedFileAtom = atom<string | null>(null);

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
  const [messages, setMessages] = useUIState<Message[]>();
  const { submitUserMessage } = useActions();
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [selectedFile] = useAtom(selectedFileAtom);

  const exampleMessages = [
    {
      heading: 'Code Quality Review',
      subheading: 'Analyze the current file for improvements',
      message: `Analyze the ${selectedFile || 'current file'} for code quality improvements. Focus on identifying unused variables, functions, or dead code, and suggest refactoring opportunities to enhance readability and maintainability.`,
    },
    {
      heading: 'Performance Optimization',
      subheading: 'Suggest performance enhancements',
      message: `Review the ${selectedFile || 'current file'} for performance optimization opportunities. Identify any inefficient algorithms, unnecessary computations, or areas where caching or memoization could be beneficial.`,
    },
    {
      heading: 'Security Best Practices',
      subheading: 'Check for potential vulnerabilities',
      message: `Examine the ${selectedFile || 'current file'} for potential security vulnerabilities. Look for issues such as injection flaws, authentication weaknesses, or insecure data handling practices.`,
    },
    {
      heading: 'Testing Improvements',
      subheading: 'Enhance test coverage and quality',
      message: `Analyze the test coverage and quality for the ${selectedFile || 'current file'}. Suggest improvements for edge case testing, error scenarios, and overall test suite efficiency.`,
    },
  ];

  const visibleExampleMessages = exampleMessages.slice(0, 2);
  const additionalExampleMessages = exampleMessages.slice(2);

  const handleExampleClick = async (message: string) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{message}</UserMessage>,
      },
    ]);

    const responseMessage = await submitUserMessage(message);

    setMessages((currentMessages) => [
      ...currentMessages,
      responseMessage,
    ]);
  };

  return (
    <div className="w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80">
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />

      <div className="p-4 sm:p-6 md:p-8"> {/* Added padding here */}
        <div className="mb-4 grid grid-cols-2 gap-4"> {/* Increased gap */}
          {messages.length === 0 && (
            <>
              {visibleExampleMessages.map((example) => (
                <ExampleMessageCard key={example.heading} example={example} onClick={handleExampleClick} />
              ))}
              {additionalExampleMessages.map((example) => (
                <ExampleMessageCard key={example.heading} example={example} onClick={handleExampleClick} className="hidden md:block" />
              ))}
            </>
          )}
        </div>

        <div className="sticky bottom-0">
          <PromptForm input={input} setInput={setInput} />
        </div>
      </div>
    </div>
  );
}

// Updated ExampleMessageCard component
function ExampleMessageCard({ example, onClick, className = '' }) {
  return (
    <div
      className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${className}`}
      onClick={() => onClick(example.message)}
    >
      <div className="text-sm font-semibold mb-1">{example.heading}</div>
      <div className="text-sm text-zinc-600">{example.subheading}</div>
    </div>
  );
}
