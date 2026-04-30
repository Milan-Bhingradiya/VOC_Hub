'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { MetricCard } from '@/components/metric-card';
import { ChartCard } from '@/components/chart-card';
import { DataTable } from '@/components/data-table';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const trendData = [
  { month: 'Jan', feedback: 145, sentiment: 65 },
  { month: 'Feb', feedback: 198, sentiment: 72 },
  { month: 'Mar', feedback: 167, sentiment: 68 },
  { month: 'Apr', feedback: 234, sentiment: 81 },
  { month: 'May', feedback: 289, sentiment: 85 },
  { month: 'Jun', feedback: 312, sentiment: 88 },
];

const sentimentData = [
  { name: 'Positive', value: 58, fill: '#10b981' },
  { name: 'Neutral', value: 28, fill: '#6b7280' },
  { name: 'Negative', value: 14, fill: '#ef4444' },
];

const recentFeedback = [
  { category: 'Performance', sentiment: 'Positive', count: '234', change: '+12%' },
  { category: 'UI/UX', sentiment: 'Positive', count: '198', change: '+8%' },
  { category: 'Bugs', sentiment: 'Negative', count: '45', change: '-15%' },
  { category: 'Features', sentiment: 'Neutral', count: '167', change: '+22%' },
];

export default function OverviewPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Executive Summary Section */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Key Performance Indicators</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard label="Total Feedback" value="1,847" trend="12%" trendUp />
            <MetricCard label="Positive Sentiment" value="58%" trend="5%" trendUp />
            <MetricCard label="Active Issues" value="42" trend="8%" trendUp={false} />
            <MetricCard label="Feature Requests" value="156" trend="18%" trendUp />
          </div>
        </div>

        {/* Analytics Section */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Trend Analysis</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Feedback Trend" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                  labelStyle={{ color: '#e4e7eb' }}
                />
                <Legend />
                <Line type="monotone" dataKey="feedback" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="sentiment" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Sentiment Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
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
        </div>

        {/* Detailed Analysis Section */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Categorical Breakdown</p>
          <ChartCard title="Feedback by Category">
          <DataTable
            columns={[
              { key: 'category', label: 'Category' },
              { key: 'sentiment', label: 'Sentiment' },
              { key: 'count', label: 'Count' },
              { key: 'change', label: 'Change' },
            ]}
            data={recentFeedback}
          />
          </ChartCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
