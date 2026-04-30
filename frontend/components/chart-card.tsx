interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, children, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-card border border-border rounded-lg p-7 hover:border-primary/30 transition-colors duration-300 ${className}`}>
      <h3 className="text-sm uppercase tracking-widest font-bold text-foreground mb-6">{title}</h3>
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
}
