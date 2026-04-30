interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}

export function MetricCard({ label, value, trend, trendUp }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-7 hover:border-primary/40 transition-colors duration-300">
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4">{label}</p>
      <div className="flex items-baseline justify-between">
        <h3 className="text-4xl font-bold text-foreground">{value}</h3>
        {trend && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-md ${trendUp ? 'bg-green-900/25 text-green-300' : 'bg-red-900/25 text-red-300'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
