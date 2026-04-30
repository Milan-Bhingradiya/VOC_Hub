'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { MetricCard } from '@/components/metric-card';
import { ChartCard } from '@/components/chart-card';
import { DataTable } from '@/components/data-table';
import { SentimentBadge } from '@/components/sentiment-badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const painPointsData = [
  { name: 'Performance', count: 234, fill: '#ef4444' },
  { name: 'Complex UI', count: 189, fill: '#f59e0b' },
  { name: 'Learning Curve', count: 156, fill: '#3b82f6' },
  { name: 'Missing Features', count: 145, fill: '#8b5cf6' },
  { name: 'Integration Issues', count: 98, fill: '#10b981' },
];

const trendData = [
  { month: 'Jan', 'Performance': 45, 'Complex UI': 32, 'Learning Curve': 28 },
  { month: 'Feb', 'Performance': 52, 'Complex UI': 38, 'Learning Curve': 31 },
  { month: 'Mar', 'Performance': 48, 'Complex UI': 35, 'Learning Curve': 29 },
  { month: 'Apr', 'Performance': 61, 'Complex UI': 42, 'Learning Curve': 38 },
  { month: 'May', 'Performance': 55, 'Complex UI': 39, 'Learning Curve': 35 },
  { month: 'Jun', 'Performance': 68, 'Complex UI': 45, 'Learning Curve': 42 },
];

const detailedPainPoints = [
  { issue: 'App takes 5+ seconds to load', category: 'Performance', priority: 'High', mentions: '67', sentiment: 'negative' },
  { issue: 'Dashboard buttons too small on mobile', category: 'Complex UI', priority: 'High', mentions: '54', sentiment: 'negative' },
  { issue: 'Unclear documentation for API', category: 'Learning Curve', priority: 'Medium', mentions: '42', sentiment: 'negative' },
  { issue: 'No dark mode option', category: 'Complex UI', priority: 'Low', mentions: '38', sentiment: 'neutral' },
  { issue: 'Settings are hard to find', category: 'Complex UI', priority: 'Medium', mentions: '35', sentiment: 'negative' },
];

export default function PainPointsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Executive Metrics */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Customer Pain Point Analysis</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard label="Total Pain Points" value="822" trend="8%" trendUp />
            <MetricCard label="Critical Issues" value="12" trend="3%" trendUp={false} />
            <MetricCard label="Avg Resolution Time" value="4.2d" trend="12%" trendUp={false} />
            <MetricCard label="Customer Impact" value="45%" trend="6%" trendUp={false} />
          </div>
        </div>

        {/* Analysis Section */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Distribution & Trends</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Pain Points by Category" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={painPointsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                  labelStyle={{ color: '#e4e7eb' }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Categories">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={painPointsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {painPointsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                  labelStyle={{ color: '#e4e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Trend */}
        <ChartCard title="Pain Points Trend">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                labelStyle={{ color: '#e4e7eb' }}
              />
              <Legend />
              <Bar dataKey="Performance" fill="#ef4444" />
              <Bar dataKey="Complex UI" fill="#f59e0b" />
              <Bar dataKey="Learning Curve" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        </div>

        {/* Detailed Analysis */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Issue Inventory</p>
          <ChartCard title="Top Pain Points Details">
          <DataTable
            columns={[
              { key: 'issue', label: 'Issue' },
              { key: 'category', label: 'Category' },
              { key: 'priority', label: 'Priority' },
              { key: 'mentions', label: 'Mentions' },
            ]}
            data={detailedPainPoints}
          />
          </ChartCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
