import { Separator } from '@/components/ui/separator';
import { AlertCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { UIState } from './types';

export interface ChatList {
  messages: UIState;
}

export function ChatList({ messages }: ChatList) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={message.id}>
          {message.display}
          {index < messages.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  );
}
