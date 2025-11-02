/**
 * Chat Component
 * 
 * Main chat interface using Vercel AI SDK's useChat hook.
 * Handles streaming responses, message display, and input management.
 */

'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { MessageBubble, type Message } from './MessageBubble';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Chat() {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
  } = useChat({
    api: '/api/ask',
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onResponse: (response) => {
      console.log('Response received:', response.status);
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4 bg-card">
        <h2 className="text-lg font-semibold">Chat with AI Support</h2>
        <p className="text-sm text-muted-foreground">
          Ask me anything about our products and services
        </p>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-6">
        <div className="py-6 space-y-4">
          {messages.length === 0 && <WelcomeMessage />}
          
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={{
                id: message.id,
                role: message.role as 'user' | 'assistant',
                content: message.content,
                timestamp: message.createdAt,
              }}
              isLast={index === messages.length - 1}
            />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="text-sm text-destructive/80 mt-1">
                  {error.message || 'Failed to get response. Please try again.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => reload()}
                  className="mt-3"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t px-6 py-4 bg-card">
        <form onSubmit={onSubmit} className="flex gap-3">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your question here..."
            disabled={isLoading}
            className="flex-1"
            maxLength={1000}
          />
          
          {isLoading ? (
            <Button
              type="button"
              variant="outline"
              onClick={stop}
              className="shrink-0"
            >
              Stop
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!input.trim()}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Send</span>
            </Button>
          )}
        </form>
        
        <p className="text-xs text-muted-foreground mt-2">
          Powered by LangChain + OpenAI • Responses may use retrieval & web search
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Welcome Message Component
// ============================================================================

function WelcomeMessage() {
  const exampleQuestions = [
    "How do I get started with the API?",
    "What are the pricing plans?",
    "How do I reset my password?",
    "Tell me about security features",
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="text-center space-y-3">
        <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
          <Send className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Welcome to AI Support</h3>
        <p className="text-muted-foreground">
          I'm here to help you with questions about our products, services, and documentation.
          I use advanced retrieval and web search to provide accurate answers.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-center">Try asking:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {exampleQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => {
                const inputElement = document.querySelector('input') as HTMLInputElement;
                if (inputElement) {
                  inputElement.value = question;
                  inputElement.focus();
                }
              }}
              className={cn(
                "text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors",
                "text-sm text-muted-foreground hover:text-foreground"
              )}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <p className="font-medium mb-2">💡 How I work:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• First, I search our knowledge base for relevant information</li>
          <li>• If confidence is low, I fallback to web search for additional context</li>
          <li>• I synthesize all sources to give you comprehensive answers</li>
          <li>• All sources are cited for transparency</li>
        </ul>
      </div>
    </div>
  );
}
