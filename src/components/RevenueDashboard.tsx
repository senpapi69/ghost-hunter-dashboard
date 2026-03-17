import { useMemo } from 'react';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Clock } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, subDays } from 'date-fns';

export function RevenueDashboard() {
  const { revenueStats, transactions } = useAppStore();

  // Generate chart data from actual transactions for last 30 days
  const chartData = useMemo(() => {
    const data = [];
    const dailyRevenue: Record<string, number> = {};

    // Group transactions by date
    transactions
      .filter(tx => tx.paymentStatus === 'paid' && tx.date)
      .forEach(tx => {
        const dateKey = format(new Date(tx.date), 'MMM d');
        dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + tx.amount;
      });

    // Generate data for last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'MMM d');
      data.push({
        date: dateKey,
        revenue: dailyRevenue[dateKey] || 0,
      });
    }
    return data;
  }, [transactions]);

  const percentChange = revenueStats.lastMonth > 0
    ? ((revenueStats.thisMonth - revenueStats.lastMonth) / revenueStats.lastMonth * 100).toFixed(1)
    : 0;
  const isPositiveChange = Number(percentChange) >= 0;

  // Get recent transactions
  const recentTransactions = transactions
    .filter(tx => tx.paymentStatus === 'paid')
    .slice(0, 5)
    .map(tx => ({
      id: tx.id,
      businessName: tx.businessName,
      package: tx.package,
      amount: tx.amount,
      date: tx.date,
      paymentStatus: tx.paymentStatus,
    }));

  const pendingTotal = transactions
    .filter(tx => tx.paymentStatus === 'pending')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const avgDealSize = transactions.length > 0
    ? transactions.reduce((sum, tx) => sum + tx.amount, 0) / transactions.length
    : 0;

  const paidCount = transactions.filter(tx => tx.paymentStatus === 'paid').length;
  const closeRate = transactions.length > 0 ? (paidCount / transactions.length * 100).toFixed(0) : 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Big Numbers Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Revenue */}
          <div className="bg-secondary/30 border border-border p-4 rounded-xl shadow-card">
            <div className="text-xs text-muted-foreground mb-1">Total Revenue</div>
            <div className="text-2xl lg:text-3xl font-mono font-bold text-success">
              $<CountUp end={revenueStats.totalRevenue} duration={2} separator="," />
            </div>
          </div>

          {/* This Month */}
          <div className="bg-secondary/30 border border-border p-4 rounded-xl shadow-card">
            <div className="text-xs text-muted-foreground mb-1">This Month</div>
            <div className="text-xl lg:text-2xl font-mono font-bold text-foreground">
              $<CountUp end={revenueStats.thisMonth} duration={2} separator="," />
            </div>
            <div className={`text-xs flex items-center gap-1 mt-1 ${isPositiveChange ? 'text-success' : 'text-destructive'}`}>
              {isPositiveChange ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {percentChange}% vs last month
            </div>
          </div>

          {/* This Week */}
          <div className="bg-secondary/30 border border-border p-4 rounded-xl shadow-card">
            <div className="text-xs text-muted-foreground mb-1">This Week</div>
            <div className="text-xl lg:text-2xl font-mono font-bold text-foreground">
              $<CountUp end={revenueStats.thisWeek} duration={2} separator="," />
            </div>
          </div>

          {/* Today */}
          <div className="bg-secondary/30 border border-border p-4 rounded-xl shadow-card">
            <div className="text-xs text-muted-foreground mb-1">Today</div>
            <div className="text-xl lg:text-2xl font-mono font-bold text-success">
              $<CountUp end={revenueStats.today} duration={2} separator="," />
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-secondary/30 border border-border p-4 rounded-xl shadow-card">
          <h3 className="font-display text-sm font-semibold text-muted-foreground mb-4">
            Revenue (Last 30 Days)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-secondary/30 border border-border p-4 rounded-xl shadow-card">
          <h3 className="font-display text-sm font-semibold text-muted-foreground mb-4">
            Recent Transactions
          </h3>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-success/10 border border-success/20 rounded-md flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{tx.businessName}</div>
                      <div className="text-xs text-muted-foreground">{tx.package}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-success font-mono font-bold">${tx.amount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(tx.date), 'MMM d, HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/30 border border-border p-3 text-center rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Avg Deal</div>
            <div className="font-mono font-bold text-foreground">${avgDealSize.toFixed(0)}</div>
          </div>
          <div className="bg-secondary/30 border border-border p-3 text-center rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Close Rate</div>
            <div className="font-mono font-bold text-foreground">{closeRate}%</div>
          </div>
          <div className="bg-secondary/30 border border-border p-3 text-center rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Outstanding</div>
            <div className="font-mono font-bold text-warning">${pendingTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
