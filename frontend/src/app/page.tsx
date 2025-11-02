/**
 * Main Page Component
 * 
 * Root page for the AI Customer Support application.
 * Features responsive layout with sidebar and chat interface.
 */

import { Chat } from '@/components/Chat';
import { Sidebar } from '@/components/Sidebar';

export default function HomePage() {
  return (
    <main className="h-screen flex overflow-hidden">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside className="hidden md:block w-80 lg:w-96 shrink-0">
        <Sidebar />
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden">
        <Chat />
      </div>
    </main>
  );
}
