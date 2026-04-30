'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Overview', href: '/' },
  { name: 'Pain Points', href: '/pain-points' },
  { name: 'Features', href: '/features' },
  { name: 'Bugs', href: '/bugs' },
  { name: 'Trends', href: '/trends' },
  { name: 'Segments', href: '/segments' },
  { name: 'Lost Deals', href: '/lost-deals' },
  { name: 'Ask Your Data', href: '/ask-data' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-72 bg-card border-r border-border flex flex-col">
        <div className="p-8 border-b border-border">
          <h1 className="text-2xl font-bold text-primary tracking-tight">VOC Hub</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2 font-semibold">Customer Intelligence Platform</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4 px-4">Core Analytics</p>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-border space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Data Management</p>
            <label className="flex items-center justify-center w-full px-4 py-4 bg-secondary/40 hover:bg-secondary/60 border-2 border-dashed border-border rounded-lg cursor-pointer transition-colors duration-200">
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground mb-1">Upload Data</p>
                <p className="text-xs text-muted-foreground">Excel, PDF, CSV</p>
              </div>
              <input type="file" className="hidden" accept=".xlsx,.xls,.pdf,.csv" />
            </label>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Version 2.1.0</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-8 py-6 shadow-sm">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
