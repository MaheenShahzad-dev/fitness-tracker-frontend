
import React, { useState, useEffect, useRef } from 'react';
import { getGroq } from '../../services/groqService';
import {
  Bot,
  X,
  Send,
  Loader2,
  MessageCircle,
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi! I am your PulseFit AI Assistant. Ask me anything about workouts, nutrition, or fitness.',
    },
  ]);

  // Automatically scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, loading]);

  // Send message to Groq AI
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();

    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: userMessage,
      },
    ]);

    setInput('');
    setLoading(true);

    try {
      const response = await getGroq(userMessage);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text:
            response.chat ||
            'Sorry, I could not generate a response.',
        },
      ]);
    } catch (error) {
      console.error('Chatbot error:', error);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">

      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-3rem)] sm:w-96 h-[480px] max-h-[75vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-emerald-600 text-white px-4 py-4 flex items-center justify-between shrink-0">

            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot size={22} />
              </div>

              <div>
                <h3 className="font-semibold">
                  PulseFit AI
                </h3>

                <p className="text-xs text-emerald-100">
                  Your Fitness Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition"
              aria-label="Close chatbot"
            >
              <X size={20} />
            </button>

          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >

                <div
                  className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed overflow-hidden ${
                    message.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-sm whitespace-pre-wrap'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm'
                  }`}
                >

                  {message.sender === 'user' ? (
                    message.text
                  ) : (
                    <div className="chatbot-markdown">

                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{

                          h1: ({ children }) => (
                            <h1 className="text-lg font-bold mb-3 mt-2">
                              {children}
                            </h1>
                          ),

                          h2: ({ children }) => (
                            <h2 className="text-base font-bold mb-2 mt-3">
                              {children}
                            </h2>
                          ),

                          h3: ({ children }) => (
                            <h3 className="font-semibold mb-2 mt-3">
                              {children}
                            </h3>
                          ),

                          p: ({ children }) => (
                            <p className="mb-3 last:mb-0">
                              {children}
                            </p>
                          ),

                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 mb-3 space-y-1">
                              {children}
                            </ul>
                          ),

                          ol: ({ children }) => (
                            <ol className="list-decimal pl-5 mb-3 space-y-1">
                              {children}
                            </ol>
                          ),

                          li: ({ children }) => (
                            <li className="pl-1">
                              {children}
                            </li>
                          ),

                          strong: ({ children }) => (
                            <strong className="font-bold">
                              {children}
                            </strong>
                          ),

                          em: ({ children }) => (
                            <em className="italic">
                              {children}
                            </em>
                          ),

                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-emerald-500 pl-3 my-3 text-slate-600 dark:text-slate-300">
                              {children}
                            </blockquote>
                          ),

                          hr: () => (
                            <hr className="my-3 border-slate-300 dark:border-slate-600" />
                          ),

                          table: ({ children }) => (
                            <div className="overflow-x-auto my-3">
                              <table className="w-full text-xs border-collapse">
                                {children}
                              </table>
                            </div>
                          ),

                          th: ({ children }) => (
                            <th className="border border-slate-300 dark:border-slate-600 p-2 bg-slate-200 dark:bg-slate-700 font-semibold text-left">
                              {children}
                            </th>
                          ),

                          td: ({ children }) => (
                            <td className="border border-slate-300 dark:border-slate-600 p-2">
                              {children}
                            </td>
                          ),

                          code: ({ children, className }) => (
                            <code
                              className={`${className || ''} bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs font-mono break-words`}
                            >
                              {children}
                            </code>
                          ),

                          a: ({ children, href }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 underline break-all"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>

                    </div>
                  )}

                </div>

              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">

                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">

                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Thinking...

                </div>

              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 shrink-0">

            <div className="flex items-center gap-2">

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask a fitness question..."
                disabled={loading}
                className="flex-1 min-w-0 px-4 py-3 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
              />

              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>

            </div>

          </div>

        </div>
      )}

      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
          aria-label="Open PulseFit AI chatbot"
        >
          <MessageCircle size={26} />
        </button>
      )}

    </div>
  );
};
