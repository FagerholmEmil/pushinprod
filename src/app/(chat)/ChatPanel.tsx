import * as React from 'react';

import { useAIState, useActions, useUIState } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { UserMessage } from './UserMessage';
import { AI } from './actions';
import { ButtonScrollToBottom } from './ButtonScrollToBottom';
import { atom, useAtom } from 'jotai';
import { PromptForm } from './PromptForm';

export const selectedFileAtom = atom<string | null>(null);

export interface ChatPanelProps {
  input: string;
  setInput: (value: string) => void;
  isAtBottom: boolean;
  scrollToBottom: () => void;
}

export function ChatPanel({
  input,
  setInput,
  isAtBottom,
  scrollToBottom,
}: ChatPanelProps) {
  const [aiState] = useAIState();
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions();
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [selectedFile] = useAtom(selectedFileAtom);

  const exampleMessages = [
    {
      heading: 'Comprehensive Code Review',
      subheading: 'Analyze for quality, performance, and best practices',
      message: `Perform a thorough code review of the ${selectedFile || 'current file'}. Focus on:
1. Code quality: Identify unused variables, functions, or dead code.
2. Performance: Detect inefficient algorithms or unnecessary computations.
3. Best practices: Suggest improvements for readability, maintainability, and adherence to SOLID principles.
4. Refactoring: Propose practical, high-impact refactoring opportunities.
Prioritize suggestions based on their potential impact and ease of implementation.`,
    },
    {
      heading: 'Performance & Scalability Audit',
      subheading: 'Optimize for efficiency and future growth',
      message: `Conduct a performance and scalability audit of the ${selectedFile || 'current file'}. Address the following:
1. Algorithmic efficiency: Identify and suggest optimizations for any inefficient algorithms.
2. Resource usage: Detect potential memory leaks or excessive resource consumption.
3. Caching & memoization: Recommend areas where caching could improve performance.
4. Scalability: Identify potential bottlenecks that could impact system scalability.
5. Asynchronous processing: Suggest opportunities for concurrent or parallel execution.
Provide practical, easy-to-implement solutions for each identified issue.`,
    },
    {
      heading: 'Security & Best Practices Assessment',
      subheading: 'Enhance code security and robustness',
      message: `Perform a security and best practices assessment of the ${selectedFile || 'current file'}. Focus on:
1. Potential vulnerabilities: Identify risks such as injection flaws, XSS, or CSRF.
2. Authentication & authorization: Evaluate the strength of user authentication and access control.
3. Data handling: Assess the security of data storage, transmission, and processing.
4. Error handling: Review exception management and logging practices.
5. Dependency security: Check for any outdated dependencies with known vulnerabilities.
Provide clear, actionable recommendations to address each identified security concern.`,
    },
    {
      heading: 'Testing Strategy Evaluation',
      subheading: 'Improve test coverage and quality assurance',
      message: `Evaluate the testing strategy for the ${selectedFile || 'current file'} and suggest improvements:
1. Test coverage: Identify areas lacking sufficient test coverage.
2. Edge cases: Recommend additional tests for boundary conditions and error scenarios.
3. Test quality: Assess the effectiveness of existing tests and suggest improvements.
4. Performance testing: Propose strategies for testing under various load conditions.
5. Mocking and stubbing: Suggest best practices for isolating units under test.
Provide a prioritized list of testing improvements to enhance overall code reliability.`,
    },
  ];

  const visibleExampleMessages = exampleMessages.slice(0, 2);
  const additionalExampleMessages = exampleMessages.slice(2);

  const handleExampleClick = async (message: string) => {
    const messageWithContext = selectedFile
      ? `For the file ${selectedFile}, ${message}\n\nHere's the content of the file:\n\`\`\`\n${getFileContent(selectedFile)}\n\`\`\``
      : `${message}\n\nPlease note that no specific file has been selected. This is a general request for the current project.`;

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{messageWithContext}</UserMessage>,
      },
    ]);

    const responseMessage = await submitUserMessage(messageWithContext);

    setMessages((currentMessages) => [...currentMessages, responseMessage]);
  };

  // Add this function to get the file content
  const getFileContent = (filePath: string) => {
    // Implement this function to return the content of the file
    // This might involve making an API call to your backend
    // For now, we'll return a placeholder
    return "// File content would be here";
  };

  return (
    <div className="w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80">
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />

      <div className="p-4 sm:p-6 md:p-8">
        {/* Added padding here */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          {/* Increased gap */}
          {messages.length === 0 && (
            <>
              {visibleExampleMessages.map((example) => (
                <ExampleMessageCard
                  key={example.heading}
                  example={example}
                  onClick={handleExampleClick}
                />
              ))}
              {additionalExampleMessages.map((example) => (
                <ExampleMessageCard
                  key={example.heading}
                  example={example}
                  onClick={handleExampleClick}
                  className="hidden md:block"
                />
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
function ExampleMessageCard({
  example,
  onClick,
  className = '',
}: {
  example: { heading: string; subheading: string; message: string };
  onClick: (message: string) => void;
  className?: string;
}) {
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