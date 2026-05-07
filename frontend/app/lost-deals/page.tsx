'use client';

import { DashboardLayout } from '../../components/dashboard-layout';
import { MetricCard } from '../../components/metric-card';
import { ChartCard } from '../../components/chart-card';
import { DataTable } from '../../components/data-table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const lostDealsData = [
  { reason: 'Price', count: 34, fill: '#ef4444' },
  { reason: 'Competitor Feature', count: 28, fill: '#f59e0b' },
  { reason: 'Performance Issues', count: 22, fill: '#3b82f6' },
  { reason: 'Support Quality', count: 18, fill: '#8b5cf6' },
  { reason: 'Integration Needs', count: 16, fill: '#10b981' },
  { reason: 'Other', count: 12, fill: '#6b7280' },
];

const monthlyLostDeals = [
  { month: 'Jan', lost: 8, retained: 24, revenue: 145000 },
  { month: 'Feb', lost: 6, retained: 28, revenue: 168000 },
  { month: 'Mar', lost: 9, retained: 26, revenue: 155000 },
  { month: 'Apr', lost: 11, retained: 32, revenue: 192000 },
  { month: 'May', lost: 10, retained: 35, revenue: 210000 },
  { month: 'Jun', lost: 10, retained: 38, revenue: 228000 },
];

const competitorComparison = [
  { competitor: 'CompetitorA', priceLeads: 18, featureLeads: 9, totalLosses: 27 },
  { competitor: 'CompetitorB', priceLeads: 12, featureLeads: 15, totalLosses: 27 },
  { competitor: 'CompetitorC', priceLeads: 4, featureLeads: 4, totalLosses: 8 },
  { competitor: 'Other', priceLeads: 0, featureLeads: 0, totalLosses: 8 },
];

const lostDealsList = [
  { company: 'Acme Corp', reason: 'Price', value: '$45k ARR', date: 'Jun 12', contact: 'John Smith' },
  { company: 'TechStart Inc', reason: 'Competitor Feature', value: '$32k ARR', date: 'Jun 10', contact: 'Sarah Johnson' },
  { company: 'Global Solutions', reason: 'Performance', value: '$58k ARR', date: 'Jun 8', contact: 'Mike Chen' },
  { company: 'Digital Ventures', reason: 'Support Quality', value: '$28k ARR', date: 'Jun 5', contact: 'Lisa Park' },
  { company: 'Innovation Labs', reason: 'Integration Needs', value: '$38k ARR', date: 'Jun 2', contact: 'Robert Davis' },
  { company: 'CloudFirst Co', reason: 'Price', value: '$52k ARR', date: 'May 29', contact: 'Emily Wilson' },
];

export default function LostDealsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Executive Metrics */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Sales Pipeline Analysis</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard label="Lost Deals (6mo)" value="64" trend="25%" trendUp />
            <MetricCard label="Lost Revenue" value="$1.2M" trend="18%" trendUp />
            <MetricCard label="Win Rate" value="76%" trend="3%" trendUp={false} />
            <MetricCard label="Avg Deal Size" value="$47.2k" trend="8%" trendUp={false} />
          </div>
        </div>

        {/* Competitive Analysis */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Churn & Competitive Intelligence</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Lost Deals by Reason">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lostDealsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="reason" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                  labelStyle={{ color: '#e4e7eb' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {lostDealsData.map((entry, index) => (
                    <Bar key={index} dataKey="count" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Reason Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={lostDealsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {lostDealsData.map((entry, index) => (
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

        {/* Trend Chart */}
        <ChartCard title="Lost Deals & Retained Revenue Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyLostDeals}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis yAxisId="left" stroke="#9ca3af" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                labelStyle={{ color: '#e4e7eb' }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="lost" stroke="#ef4444" strokeWidth={2} name="Lost Deals" />
              <Line yAxisId="left" type="monotone" dataKey="retained" stroke="#10b981" strokeWidth={2} name="Retained" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="New Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Competitor Comparison */}
        <ChartCard title="Competitive Loss Analysis">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={competitorComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="competitor" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748' }}
                labelStyle={{ color: '#e4e7eb' }}
              />
              <Legend />
              <Bar dataKey="priceLeads" fill="#ef4444" name="Price Issues" />
              <Bar dataKey="featureLeads" fill="#f59e0b" name="Feature Gaps" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recent Lost Deals */}
        <ChartCard title="Recent Lost Deals">
          <DataTable
            columns={[
              { key: 'company', label: 'Company' },
              { key: 'reason', label: 'Reason' },
              { key: 'value', label: 'ARR Value' },
              { key: 'date', label: 'Date' },
              { key: 'contact', label: 'Contact' },
            ]}
            data={lostDealsList}
          />
          </ChartCard>
        </div>

        {/* Strategic Recommendations */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-6">Strategic Action Items</p>
          <div className="bg-card border border-border rounded-lg p-7 hover:border-primary/30 transition-colors duration-300">
            <p className="text-sm uppercase tracking-widest font-bold text-primary mb-6">Recommended Actions</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">1.</span>
              <div>
                <p className="font-medium text-foreground">Competitive Pricing Strategy</p>
                <p className="text-sm text-muted-foreground">Review pricing model - 34 deals lost to price concerns. Consider tiered pricing.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">2.</span>
              <div>
                <p className="font-medium text-foreground">Feature Roadmap</p>
                <p className="text-sm text-muted-foreground">28 deals lost to competitor features. Prioritize missing integrations and API features.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">3.</span>
              <div>
                <p className="font-medium text-foreground">Performance Optimization</p>
                <p className="text-sm text-muted-foreground">22 deals lost to performance issues. Audit and optimize critical user paths.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold">4.</span>
              <div>
                <p className="font-medium text-foreground">Support Quality</p>
                <p className="text-sm text-muted-foreground">18 deals lost due to support concerns. Expand support team and improve SLAs.</p>
              </div>
            </li>
          </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
