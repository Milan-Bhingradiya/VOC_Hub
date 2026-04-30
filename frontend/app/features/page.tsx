'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { MetricCard } from '@/components/metric-card';
import { ChartCard } from '@/components/chart-card';
import { DataTable } from '@/components/data-table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const featureTrendData = [
  { month: 'Jan', requests: 45, priority: 12, planned: 8 },
  { month: 'Feb', requests: 58, priority: 15, planned: 10 },
  { month: 'Mar', requests: 52, priority: 14, planned: 9 },
  { month: 'Apr', requests: 71, priority: 18, planned: 13 },
  { month: 'May', requests: 89, priority: 22, planned: 16 },
  { month: 'Jun', requests: 104, priority: 28, planned: 20 },
];

const featureRequests = [
  { feature: 'API Rate Limiting Control', votes: '234', status: 'Planned', category: 'Performance' },
  { feature: 'Dark Mode Theme', votes: '198', status: 'In Progress', category: 'UI' },
  { feature: 'Advanced Filtering', votes: '176', status: 'Planned', category: 'Features' },
  { feature: 'Email Notifications', votes: '154', status: 'Backlog', category: 'Integrations' },
  { feature: 'Custom Reports Export', votes: '142', status: 'Backlog', category: 'Reporting' },
  { feature: 'Mobile App', votes: '128', status: 'Backlog', category: 'Platform' },
  { feature: 'SSO Integration', votes: '115', status: 'In Progress', category: 'Security' },
  { feature: 'Webhooks Support', votes: '98', status: 'Planned', category: 'Integrations' },
];

export default function FeaturesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Executive Metrics */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Feature Request Pipeline</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard label="Feature Requests" value="1,342" trend="24%" trendUp />
            <MetricCard label="High Priority" value="89" trend="18%" trendUp />
            <MetricCard label="In Development" value="12" trend="3%" trendUp />
            <MetricCard label="Community Votes" value="3,847" trend="42%" trendUp />
          </div>
        </div>

        {/* Trend Analysis */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Growth Metrics</p>
          <ChartCard title="Feature Request Trend">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                labelStyle={{ color: '#e4e7eb' }}
              />
              <Legend />
              <Bar dataKey="requests" fill="#3b82f6" />
              <Bar dataKey="priority" fill="#f59e0b" />
              <Bar dataKey="planned" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Feature Requests Table */}
        <ChartCard title="Top Feature Requests">
          <DataTable
            columns={[
              { key: 'feature', label: 'Feature' },
              { key: 'votes', label: 'Votes' },
              { key: 'status', label: 'Status' },
              { key: 'category', label: 'Category' },
            ]}
            data={featureRequests}
          />
          </ChartCard>
        </div>

        {/* Category Breakdown */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Request Distribution by Category</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-7 hover:border-primary/30 transition-colors duration-300">
              <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">Performance</p>
              <p className="text-4xl font-bold text-primary mb-3">234</p>
              <p className="text-xs text-muted-foreground font-medium">open requests</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-7 hover:border-primary/30 transition-colors duration-300">
              <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">Integrations</p>
              <p className="text-4xl font-bold text-accent mb-3">187</p>
              <p className="text-xs text-muted-foreground font-medium">open requests</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-7 hover:border-primary/30 transition-colors duration-300">
              <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">UI/UX</p>
              <p className="text-4xl font-bold text-blue-400 mb-3">289</p>
              <p className="text-xs text-muted-foreground font-medium">open requests</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
