'use client';

import { DashboardLayout } from '../../components/dashboard-layout';
import { MetricCard } from '../../components/metric-card';
import { ChartCard } from '../../components/chart-card';
import { DataTable } from '../../components/data-table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const segmentData = [
  { segment: 'Enterprise', customers: 128, satisfaction: 89, NPS: 72, churn: 2 },
  { segment: 'Mid-Market', customers: 324, satisfaction: 82, NPS: 58, churn: 5 },
  { segment: 'SMB', customers: 756, satisfaction: 76, NPS: 45, churn: 12 },
  { segment: 'Startup', customers: 442, satisfaction: 71, NPS: 38, churn: 18 },
];

const industryData = [
  { industry: 'SaaS', customers: 412, satisfaction: 84 },
  { industry: 'Finance', customers: 298, satisfaction: 88 },
  { industry: 'Healthcare', customers: 186, satisfaction: 81 },
  { industry: 'Retail', customers: 267, customers: 87, satisfaction: 75 },
  { industry: 'Other', customers: 287, satisfaction: 72 },
];

const companySize = [
  { segment: 'Enterprise', satisfaction: 89, retention: 98, adoption: 92 },
  { segment: 'Mid-Market', satisfaction: 82, retention: 95, adoption: 87 },
  { segment: 'SMB', satisfaction: 76, retention: 88, adoption: 74 },
  { segment: 'Startup', satisfaction: 71, retention: 82, adoption: 65 },
];

const segmentMetrics = [
  { name: 'Enterprise', feedback: '342', painPoints: '8', features: '45', nps: '72' },
  { name: 'Mid-Market', feedback: '567', painPoints: '24', features: '98', nps: '58' },
  { name: 'SMB', feedback: '834', painPoints: '67', features: '156', nps: '45' },
  { name: 'Startup', feedback: '612', painPoints: '48', features: '89', nps: '38' },
];

export default function SegmentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Executive Metrics */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Customer Segmentation Analysis</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard label="Total Customers" value="1.65k" trend="8%" trendUp />
            <MetricCard label="Avg Satisfaction" value="79.5%" trend="4%" trendUp />
            <MetricCard label="Segments Analyzed" value="4" trend="0%" />
            <MetricCard label="Churn Variance" value="16pts" trend="3%" trendUp={false} />
          </div>
        </div>

        {/* Segment Analysis */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Segment Performance & Benchmarking</p>
          <ChartCard title="Segment Satisfaction & NPS">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={segmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="segment" stroke="#9ca3af" />
              <YAxis yAxisId="left" stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                labelStyle={{ color: '#e4e7eb' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="satisfaction" fill="#10b981" name="Satisfaction %" />
              <Bar yAxisId="right" dataKey="NPS" fill="#3b82f6" name="NPS Score" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Radar Chart for Segment Comparison */}
        <ChartCard title="Segment Performance Comparison">
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={companySize}>
              <PolarGrid stroke="#2d3748" />
              <PolarAngleAxis dataKey="segment" stroke="#9ca3af" />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Radar name="Satisfaction" dataKey="satisfaction" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="Retention" dataKey="retention" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="Adoption" dataKey="adoption" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              <Legend />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                labelStyle={{ color: '#e4e7eb' }}
              />
            </RadarChart>
          </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Detailed Analysis */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Feedback Inventory & Recommendations</p>
          <ChartCard title="Segment Feedback Summary">
          <DataTable
            columns={[
              { key: 'name', label: 'Segment' },
              { key: 'feedback', label: 'Feedback Count' },
              { key: 'painPoints', label: 'Pain Points' },
              { key: 'features', label: 'Feature Requests' },
              { key: 'nps', label: 'NPS' },
            ]}
            data={segmentMetrics}
          />
          </ChartCard>
        </div>

        {/* Segment Profiles */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Segment Profiles & Strategic Priorities</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-7 hover:border-primary/30 transition-colors duration-300">
              <p className="text-sm uppercase tracking-widest font-bold text-primary mb-6">Enterprise</p>
              <p className="text-xs text-muted-foreground mb-4 font-semibold">128 Customers</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Satisfaction</span>
                  <span className="text-sm font-semibold text-foreground">89%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '89%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Retention</span>
                  <span className="text-sm font-semibold text-foreground">98%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Feedback: <span className="text-foreground font-semibold">342 items</span></p>
                <p className="text-sm text-muted-foreground">Priority: Focus on premium features & performance</p>
              </div>
            </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-7 hover:border-primary/30 transition-colors duration-300">
              <p className="text-sm uppercase tracking-widest font-bold text-yellow-400 mb-6">Small & Medium Business</p>
              <p className="text-xs text-muted-foreground mb-4 font-semibold">756 Customers</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Satisfaction</span>
                  <span className="text-sm font-semibold text-foreground">76%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '76%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Retention</span>
                  <span className="text-sm font-semibold text-foreground">88%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '88%' }}></div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Feedback: <span className="text-foreground font-semibold">834 items</span></p>
                <p className="text-sm text-muted-foreground">Priority: Affordability & ease of use</p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
