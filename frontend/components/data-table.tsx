interface DataTableProps {
  columns: { key: string; label: string }[];
  data: Record<string, any>[];
  className?: string;
}

export function DataTable({ columns, data, className = '' }: DataTableProps) {
  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/40">
            {columns.map((col) => (
              <th key={col.key} className="px-8 py-4 text-left text-xs uppercase tracking-widest font-bold text-muted-foreground">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-border hover:bg-secondary/20 transition-colors duration-200">
              {columns.map((col) => (
                <td key={`${idx}-${col.key}`} className="px-8 py-4 text-sm text-foreground">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
