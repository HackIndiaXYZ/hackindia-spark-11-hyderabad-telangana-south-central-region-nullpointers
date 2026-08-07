import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Terminal, Loader2 } from 'lucide-react';
import { askCopilot, type CopilotMessage } from '../services/groqService';

export const CopilotChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    { role: 'assistant', content: 'CROWDOS Copilot online. How can I assist with operational intelligence today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: CopilotMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = [...messages, userMsg];
    
    // Call the Groq Service
    const response = await askCopilot(history);

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all z-50 flex items-center justify-center cursor-pointer group"
        >
          <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden font-sans animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-[#09090b] border-b border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-200">Commander Copilot</h3>
                <p className="text-[10px] font-mono text-emerald-400">Powered by Groq & LLaMA-3</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-[#27272a] rounded text-slate-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
              >
                <span className={`text-[10px] font-bold uppercase mb-1 ${msg.role === 'user' ? 'text-slate-500 self-end' : 'text-indigo-400 self-start'}`}>
                  {msg.role === 'user' ? 'Commander' : 'AI Copilot'}
                </span>
                <div 
                  className={`p-3 rounded-xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-sm' 
                      : 'bg-[#27272a] text-slate-200 border border-[#3f3f46] rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="self-start flex flex-col max-w-[85%]">
                <span className="text-[10px] font-bold uppercase mb-1 text-indigo-400 self-start">AI Copilot</span>
                <div className="p-3 rounded-xl bg-[#27272a] text-slate-200 border border-[#3f3f46] rounded-bl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span className="text-xs text-slate-400">Retrieving SOPs...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#09090b] border-t border-[#27272a]">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about procedures, anomalies..."
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl pl-4 pr-12 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none h-[46px] overflow-hidden leading-tight"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-[#27272a] disabled:text-slate-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
