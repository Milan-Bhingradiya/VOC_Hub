type Sentiment = 'positive' | 'negative' | 'neutral' | 'open' | 'resolved';

interface SentimentBadgeProps {
  sentiment: Sentiment;
  label?: string;
}

const sentimentStyles: Record<Sentiment, { bg: string; text: string }> = {
  positive: { bg: 'bg-green-900/25', text: 'text-green-300' },
  negative: { bg: 'bg-red-900/25', text: 'text-red-300' },
  neutral: { bg: 'bg-gray-900/25', text: 'text-gray-300' },
  open: { bg: 'bg-yellow-900/25', text: 'text-yellow-300' },
  resolved: { bg: 'bg-green-900/25', text: 'text-green-300' },
};

export function SentimentBadge({ sentiment, label }: SentimentBadgeProps) {
  const style = sentimentStyles[sentiment];
  const displayLabel = label || sentiment.charAt(0).toUpperCase() + sentiment.slice(1);

  return (
    <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${style.bg} ${style.text}`}>
      {displayLabel}
    </span>
  );
}
