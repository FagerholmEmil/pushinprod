'use client';

import { useScrollAnchor } from '@/lib/useScrollAnchor';
import { cn } from '@/lib/utils';
import { useUIState } from 'ai/rsc';
import React, { ReactNode, useState } from 'react';
import { EmptyScreen } from './EmptyScreen';
import { ChatList } from './ChatList';
import { ChatPanel } from './ChatPanel';

interface FileChatProps {}

export const FileChat: React.FC<FileChatProps> = ({}) => {
  const [input, setInput] = useState('');

  const [messages] = useUIState();

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor();

  return (
    <div className="group w-full overflow-y-auto pl-0" ref={scrollRef}>
      <div className={cn(messages.length > 0 ? 'pt-6' : '')} ref={messagesRef}>
        {messages.length ? (
          <ChatList messages={messages} isShared={false} />
        ) : // <EmptyScreen />
        null}
        <div className="w-full h-px" ref={visibilityRef} />
      </div>
      <ChatPanel
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />
    </div>
  );
};
