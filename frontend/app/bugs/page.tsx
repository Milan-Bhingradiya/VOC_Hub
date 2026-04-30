'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { MetricCard } from '@/components/metric-card';
import { ChartCard } from '@/components/chart-card';
import { DataTable } from '@/components/data-table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const bugTrendData = [
  { month: 'Jan', open: 45, resolved: 32, inProgress: 12 },
  { month: 'Feb', open: 52, resolved: 38, inProgress: 15 },
  { month: 'Mar', open: 42, resolved: 45, inProgress: 10 },
  { month: 'Apr', open: 38, resolved: 52, inProgress: 8 },
  { month: 'May', open: 35, resolved: 48, inProgress: 6 },
  { month: 'Jun', open: 28, resolved: 55, inProgress: 4 },
];

const severityData = [
  { severity: 'Critical', count: 3, fill: '#ef4444' },
  { severity: 'High', count: 8, fill: '#f59e0b' },
  { severity: 'Medium', count: 12, fill: '#3b82f6' },
  { severity: 'Low', count: 5, fill: '#10b981' },
];

const bugsList = [
  { id: 'BUG-001', title: 'Login page crash on Safari', severity: 'Critical', status: 'Open', reports: '47' },
  { id: 'BUG-002', title: 'Data export timeout', severity: 'High', status: 'In Progress', reports: '32' },
  { id: 'BUG-003', title: 'Incorrect timezone display', severity: 'Medium', status: 'Resolved', reports: '28' },
  { id: 'BUG-004', title: 'Dropdown menu misaligned', severity: 'Low', status: 'Resolved', reports: '18' },
  { id: 'BUG-005', title: 'API rate limit error message unclear', severity: 'Medium', status: 'In Progress', reports: '24' },
  { id: 'BUG-006', title: 'Slow search performance', severity: 'High', status: 'Open', reports: '35' },
  { id: 'BUG-007', title: 'Mobile responsiveness issue', severity: 'Medium', status: 'In Progress', reports: '19' },
];

export default function BugsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Executive Metrics */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Issue Management Dashboard</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard label="Total Bugs Reported" value="156" trend="12%" trendUp />
            <MetricCard label="Open Issues" value="28" trend="22%" trendUp={false} />
            <MetricCard label="Resolved This Month" value="18" trend="8%" trendUp />
            <MetricCard label="Avg Resolution Time" value="2.4d" trend="15%" trendUp={false} />
          </div>
        </div>

        {/* Analysis Section */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Bug Lifecycle Analysis</p>
          <ChartCard title="Bug Resolution Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bugTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                labelStyle={{ color: '#e4e7eb' }}
              />
              <Legend />
              <Line type="monotone" dataKey="open" stroke="#ef4444" strokeWidth={2} name="Open" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
              <Line type="monotone" dataKey="inProgress" stroke="#f59e0b" strokeWidth={2} name="In Progress" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

          <ChartCard title="Bugs by Severity">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="severity" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                labelStyle={{ color: '#e4e7eb' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {severityData.map((entry, index) => (
                  <Bar key={index} dataKey="count" fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Detailed Analysis */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Issue Inventory</p>
          <ChartCard title="Open & In Progress Issues">
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'title', label: 'Title' },
              { key: 'severity', label: 'Severity' },
              { key: 'status', label: 'Status' },
              { key: 'reports', label: 'Reports' },
            ]}
            data={bugsList}
          />
          </ChartCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
