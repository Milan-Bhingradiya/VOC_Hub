'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { MetricCard } from '@/components/metric-card';
import { ChartCard } from '@/components/chart-card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const trendsData = [
  { month: 'Jan', satisfaction: 72, NPS: 42, retention: 88, churn: 12 },
  { month: 'Feb', satisfaction: 74, NPS: 45, retention: 89, churn: 11 },
  { month: 'Mar', satisfaction: 76, NPS: 48, retention: 90, churn: 10 },
  { month: 'Apr', satisfaction: 79, NPS: 52, retention: 91, churn: 9 },
  { month: 'May', satisfaction: 82, NPS: 56, retention: 92, churn: 8 },
  { month: 'Jun', satisfaction: 85, NPS: 61, retention: 93, churn: 7 },
];

const monthlyTrends = [
  { month: 'Jan', new: 45, returning: 120, inactive: 32 },
  { month: 'Feb', new: 52, returning: 134, inactive: 28 },
  { month: 'Mar', new: 48, returning: 145, inactive: 25 },
  { month: 'Apr', new: 61, returning: 156, inactive: 22 },
  { month: 'May', new: 73, returning: 168, inactive: 18 },
  { month: 'Jun', new: 89, returning: 182, inactive: 15 },
];

const feedbackVolumeTrend = [
  { month: 'Jan', volume: 234, growth: 0 },
  { month: 'Feb', volume: 267, growth: 14.1 },
  { month: 'Mar', volume: 289, growth: 8.2 },
  { month: 'Apr', volume: 321, growth: 11.1 },
  { month: 'May', volume: 368, growth: 14.6 },
  { month: 'Jun', volume: 421, growth: 14.4 },
];

export default function TrendsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Executive Metrics */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Key Performance Indicators</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard label="Customer Satisfaction" value="85%" trend="13pts" trendUp />
            <MetricCard label="NPS Score" value="61" trend="19pts" trendUp />
            <MetricCard label="Retention Rate" value="93%" trend="5pts" trendUp />
            <MetricCard label="Churn Rate" value="7%" trend="5pts" trendUp={false} />
          </div>
        </div>

        {/* Trend Analysis */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Six Month Performance Trajectory</p>
          <ChartCard title="Key Customer Metrics Trend">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                labelStyle={{ color: '#e4e7eb' }}
              />
              <Legend />
              <Line type="monotone" dataKey="satisfaction" stroke="#10b981" strokeWidth={2} name="Satisfaction %" />
              <Line type="monotone" dataKey="NPS" stroke="#3b82f6" strokeWidth={2} name="NPS Score" />
              <Line type="monotone" dataKey="retention" stroke="#f59e0b" strokeWidth={2} name="Retention %" />
              <Line type="monotone" dataKey="churn" stroke="#ef4444" strokeWidth={2} name="Churn %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* User Segments Trend */}
        <ChartCard title="User Engagement Trend">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                labelStyle={{ color: '#e4e7eb' }}
              />
              <Legend />
              <Area type="monotone" dataKey="new" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="New Users" />
              <Area type="monotone" dataKey="returning" stackId="1" stroke="#10b981" fill="#10b981" name="Returning" />
              <Area type="monotone" dataKey="inactive" stackId="1" stroke="#6b7280" fill="#6b7280" name="Inactive" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Feedback Volume Growth */}
        <ChartCard title="Feedback Volume & Growth Rate">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={feedbackVolumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis yAxisId="left" stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                labelStyle={{ color: '#e4e7eb' }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} name="Volume" />
              <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={2} name="Growth %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        </div>

        {/* Strategic Insights */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Strategic Insights & Recommendations</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-7 hover:border-primary/30 transition-colors duration-300">
              <p className="text-xs uppercase tracking-widest font-bold text-accent mb-4">Positive Trends</p>
            <ul className="space-y-3 text-sm text-foreground">
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold mt-0.5">●</span>
                <span>Customer satisfaction has increased 13 points over 6 months</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold mt-0.5">●</span>
                <span>NPS score trending up with consistent month-over-month growth</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold mt-0.5">●</span>
                <span>Retention rate at all-time high of 93%</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold mt-0.5">●</span>
                <span>Feedback volume growing 14.4% month-over-month</span>
              </li>
            </ul>
          </div>

            <div className="bg-card border border-border rounded-lg p-7 hover:border-primary/30 transition-colors duration-300">
              <p className="text-xs uppercase tracking-widest font-bold text-destructive mb-4">Areas of Focus</p>
              <ul className="space-y-3 text-sm text-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold mt-0.5">▸</span>
                  <span>Monitor churn rate carefully as market conditions change</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold mt-0.5">▸</span>
                  <span>Inactive user segment still at 15 - focus on re-engagement</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold mt-0.5">▸</span>
                  <span>Continue investing in customer experience improvements</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold mt-0.5">▸</span>
                  <span>High feedback volume suggests feature development opportunities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
