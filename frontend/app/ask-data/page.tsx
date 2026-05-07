'use client';

import { DashboardLayout } from '../../components/dashboard-layout';
import { useState } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestionQueries = [
  'What is our highest pain point by segment?',
  'Show me the top feature requests this month',
  'Which competitor is taking the most deals?',
  'What is the trend in NPS scores?',
];

const mockResponses: Record<string, string> = {
  'what is our highest pain point by segment?': 'Based on our data, the highest pain point varies by segment:\n\n• Enterprise: Performance (12 mentions) - App load time takes 5+ seconds\n• Mid-Market: Complex UI (18 mentions) - Dashboard navigation is confusing\n• SMB: Learning Curve (24 mentions) - Documentation could be clearer\n• Startup: Missing Features (19 mentions) - Integration with popular tools needed\n\nOverall, the most critical issue affecting revenue is performance in the Enterprise segment.',
  'show me the top feature requests this month': 'Here are the top feature requests for June 2024:\n\n1. API Rate Limiting Control - 234 votes\n2. Dark Mode Theme - 198 votes\n3. Advanced Filtering - 176 votes\n4. Email Notifications - 154 votes\n5. Custom Reports Export - 142 votes\n\nThe dark mode request shows 32% month-over-month growth and is trending strongly across all segments.',
  'which competitor is taking the most deals?': 'Competitive analysis shows:\n\n• CompetitorA: 27 lost deals (67% price-driven, 33% feature-driven)\n• CompetitorB: 27 lost deals (44% price-driven, 56% feature-driven)\n• CompetitorC: 8 lost deals (50% price-driven, 50% feature-driven)\n\nCompetitorA is winning primarily on price, while CompetitorB is winning on feature completeness. We should focus on our competitive pricing strategy and accelerate feature development.',
  'what is the trend in nps scores?': 'NPS Score Trend (6 months):\n\nJan: 42 → Feb: 45 → Mar: 48 → Apr: 52 → May: 56 → Jun: 61\n\nThis represents a 19-point improvement (+45%) in just 6 months. Key drivers:\n• Customer satisfaction increased from 72% to 85%\n• Support resolution time improved by 3 days\n• Product reliability initiatives reduced downtime\n\nWe&apos;re on track to reach NPS 70+ by Q4 2024 if current trends continue.',
};

export default function AskYourDataPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to Ask Your Data! I can help you explore customer feedback insights, sentiment analysis, and VOC metrics. Try asking me questions like "What is our highest pain point?" or "Show feature requests by category".',
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: String(messages.length + 1),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const responseKey = textToSend.toLowerCase();
      let responseContent = mockResponses[responseKey];

      if (!responseContent) {
        // Find best match for similar queries
        const matchedKey = Object.keys(mockResponses).find((key) =>
          responseKey.includes(key.split(' ').slice(0, 3).join(' '))
        );
        responseContent = matchedKey
          ? mockResponses[matchedKey]
          : `I found data related to your query. Let me analyze the VOC metrics...\n\nBased on the available feedback data, ${textToSend.toLowerCase().includes('customer') ? 'customers are expressing concerns about performance and integration needs' : 'the data shows interesting trends in your feedback metrics'}. Would you like me to dive deeper into any specific segment or metric?`;
      }

      const assistantMessage: ChatMessage = {
        id: String(messages.length + 2),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">Natural Language Interface</p>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Query Your Data</h2>
          <p className="text-sm text-muted-foreground mt-2">Ask questions about customer feedback, sentiment, pain points, and business metrics in natural language.</p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-card border border-border rounded-lg p-8 mb-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-lg px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary/40 text-foreground border border-border'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                <span className="text-xs opacity-60 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary text-foreground border border-border rounded-lg px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="mb-6 flex-shrink-0">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Example Queries</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestionQueries.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(query)}
                  className="text-left p-4 bg-secondary/40 hover:bg-secondary/60 border border-border rounded-lg transition-all duration-200 text-sm text-foreground hover:border-primary/40 font-medium"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-3 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask me about pain points, features, bugs, trends, segments..."
            disabled={isLoading}
            className="flex-1 bg-input border border-border rounded-lg px-5 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 transition-all duration-200"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap"
          >
            {isLoading ? 'Analyzing...' : 'Send'}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-4 flex-shrink-0 bg-secondary/40 border border-border rounded-lg p-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold">Note:</span> This interface supports natural language queries about customer feedback, sentiment analysis, pain points, feature requests, bugs, trends, and customer segments. Ask questions as you would in a business setting.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
