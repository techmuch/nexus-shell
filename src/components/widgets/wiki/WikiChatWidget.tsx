import React, { useState } from 'react';
import { useWikiStore } from '../../../core/services/useWikiStore';
import { MessageSquare, Send, Loader2, BookOpen } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: { pageId: string; snippet: string }[];
}

export const WikiChatWidget: React.FC = () => {
  const { semanticSearch, generateCompletion, setActivePage } = useWikiStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 1. Retrieve Context (RAG)
    const results = await semanticSearch(userMessage.content);
    
    // 2. Generate Answer based on Context
    const contextText = results.map(r => r.snippet).join('\n');
    const answer = await generateCompletion(contextText, userMessage.content);

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: answer,
      citations: results
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] border-l border-[var(--border)]">
      <div className="flex items-center gap-2 p-3 border-b border-[var(--border)]">
        <MessageSquare className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
          Semantic Wiki Chat
        </span>
      </div>
      
      {/* Chat History */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-lg text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-500 text-white rounded-br-none' 
                : 'bg-[var(--muted)] text-[var(--foreground)] rounded-bl-none'
            }`}>
              {msg.content}
            </div>
            
            {/* Citations block */}
            {msg.citations && msg.citations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {msg.citations.map((cite, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => setActivePage(cite.pageId)}
                    className="flex items-center gap-1 text-[10px] bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 rounded transition-colors"
                  >
                    <BookOpen className="w-3 h-3" /> Source {cIdx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[var(--muted-foreground)] space-y-2">
            <MessageSquare className="w-8 h-8 opacity-20" />
            <span className="text-sm">Ask questions about the wiki...</span>
          </div>
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Loader2 className="w-4 h-4 animate-spin" /> Searching knowledge base...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-[var(--border)]">
        <div className="flex items-center bg-[var(--card)] border border-[var(--border)] rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-indigo-500">
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-sm p-2 text-[var(--foreground)]"
            placeholder="Search or ask..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
