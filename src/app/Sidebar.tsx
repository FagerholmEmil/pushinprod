'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import React, { useState } from 'react'

interface SidebarProps {}

export const Sidebar: React.FC<SidebarProps> = ({}) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <aside
      className={cn(
        'border-r flex flex-col transition-all duration-300 ease-in-out p-4 h-full w-full',
        expanded ? 'max-w-lg' : 'max-w-80'
      )}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="flex justify-between">
          <h1>Ask stuff</h1>
          {expanded ? (
            <PanelLeftClose
              className="w-4 h-4 cursor-pointer"
              onClick={() => setExpanded(false)}
            />
          ) : (
            <PanelLeftOpen
              className="w-4 h-4 cursor-pointer"
              onClick={() => setExpanded(true)}
            />
          )}
        </div>

        <Label className="text-secondary-foreground">Button.tsx</Label>
        <div className="rounded bg-secondary p-2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique,
          harum.
        </div>
      </div>

      <div className="flex-shrink-0">
        <Input placeholder="Ask stuff" />
      </div>
    </aside>
  )
}
