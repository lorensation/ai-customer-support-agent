/**
 * MessageBubble Component
 * 
 * Renders individual chat messages with role-based styling.
 * Supports markdown, code blocks, and source citations.
 */

'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Array<{
    id: string | number;
    filename: string;
    url?: string;
    excerpt?: string;
  }>;
  timestamp?: Date;
}

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex gap-4 mb-4',
        isUser && 'flex-row-reverse',
        isLast && 'animate-in fade-in slide-in-from-bottom-2 duration-300'
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(
        'h-8 w-8 shrink-0',
        isUser && 'bg-primary',
        isAssistant && 'bg-secondary'
      )}>
        <AvatarFallback>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn(
        'flex flex-col gap-2 max-w-[80%]',
        isUser && 'items-end'
      )}>
        {/* Role Label */}
        <span className="text-xs font-medium text-muted-foreground">
          {isUser ? 'You' : 'AI Assistant'}
        </span>

        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-lg px-4 py-3 text-sm',
            isUser && 'bg-primary text-primary-foreground',
            isAssistant && 'bg-muted',
            'prose prose-sm dark:prose-invert max-w-none',
            isUser && 'prose-invert'
          )}
        >
          {isAssistant ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-4 mb-2" {...props} />,
                h4: ({ node, ...props }) => <h4 className="text-sm font-semibold mt-3 mb-1" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
                li: ({ node, ...props }) => <li className="my-1" {...props} />,
                p: ({ node, ...props }) => <p className="my-2 leading-relaxed" {...props} />,
                code: ({ node, inline, ...props }: any) => 
                  inline ? (
                    <code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                  ) : (
                    <code className="block bg-secondary p-3 rounded my-2 text-xs font-mono overflow-x-auto" {...props} />
                  ),
                pre: ({ node, ...props }) => <pre className="bg-secondary p-3 rounded my-2 overflow-x-auto" {...props} />,
                a: ({ node, ...props }) => <a className="text-primary underline hover:no-underline" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          )}
        </div>

        {/* Sources Section */}
        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source) => (
                <SourceChip key={source.id} source={source} />
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        {message.timestamp && (
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Source Chip Component
// ============================================================================

interface SourceChipProps {
  source: {
    id: string | number;
    filename: string;
    url?: string;
    excerpt?: string;
  };
}

function SourceChip({ source }: SourceChipProps) {
  const content = (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded-md text-xs hover:bg-secondary transition-colors">
      <span className="font-medium">{source.filename}</span>
      {source.url && <ExternalLink className="h-3 w-3" />}
    </div>
  );

  if (source.url) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        title={source.excerpt}
        className="inline-block"
      >
        {content}
      </a>
    );
  }

  return (
    <span title={source.excerpt}>
      {content}
    </span>
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}
