'use client';

import { useScrollAnchor } from '@/lib/useScrollAnchor';
import { cn } from '@/lib/utils';
import { useUIState } from 'ai/rsc';
import React, { useEffect, useState } from 'react';
import { ChatList } from './ChatList';
import { ChatPanel } from './ChatPanel';

interface FileChatProps {}

export const FileChat: React.FC<FileChatProps> = ({}) => {
  const [input, setInput] = useState('');

  const [messages] = useUIState();

  const { messagesRef, scrollRef, visibilityRef, scrollToBottom } =
    useScrollAnchor();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      className="group w-full grid grid-rows-[1fr_auto] relative h-full overflow-y-auto pl-0"
      ref={scrollRef}
    >
      <div
        className={cn('overflow-y-auto', messages.length > 0 && 'pt-6')}
        ref={messagesRef}
      >
        {messages.length ? (
          <ChatList messages={messages} />
        ) : // <EmptyScreen />
        null}

        <div className="w-full h-px" ref={visibilityRef} />
      </div>
      <ChatPanel input={input} setInput={setInput} />
    </div>
  );
};
