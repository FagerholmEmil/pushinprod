import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useActions } from 'ai/rsc';
import React, { ReactNode, useState } from 'react';

interface FileChatProps {}

export const FileChat: React.FC<FileChatProps> = ({}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ReactNode[]>([]);
  const { submitMessage } = useActions();

  console.log(messages);

  return (
    <div>
      <Input
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
        }}
      />
      <Button
        onClick={async () => {
          const { ui } = await submitMessage(input);
          setMessages((currentMessages) => [...currentMessages, ui]);
        }}
      >
        Submit
      </Button>

      {messages.map((message) => message)}
    </div>
  );
};
