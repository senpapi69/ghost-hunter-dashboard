import { useMemo } from 'react';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Clock } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, subDays } from 'date-fns';

export function RevenueDashboard() {
  const { revenueStats, transactions, buildJobs } = useAppStore();

  // Generate mock chart data for last 30 days
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, 'MMM d'),
        revenue: Math.floor(Math.random() * 500) + (i < 7 ? 200 : 0),
      });
    }
    return data;
  }, []);

  const percentChange = revenueStats.lastMonth > 0 
    ? ((revenueStats.thisMonth - revenueStats.lastMonth) / revenueStats.lastMonth * 100).toFixed(1)
    : 0;
  const isPositiveChange = Number(percentChange) >= 0;

  // Get recent transactions from build jobs
  const recentTransactions = buildJobs
    .filter(job => job.paymentStatus === 'paid')
    .slice(0, 5)
    .map(job => ({
      id: job.id,
      businessName: job.businessName,
      package: job.package,
      amount: job.amount,
      date: job.triggeredAt,
      paymentStatus: job.paymentStatus,
    }));

  const pendingTotal = buildJobs
    .filter(job => job.paymentStatus === 'pending')
    .reduce((sum, job) => sum + job.amount, 0);

  const avgDealSize = buildJobs.length > 0
    ? buildJobs.reduce((sum, job) => sum + job.amount, 0) / buildJobs.length
    : 0;

  const paidCount = buildJobs.filter(job => job.paymentStatus === 'paid').length;
  const closeRate = buildJobs.length > 0 ? (paidCount / buildJobs.length * 100).toFixed(0) : 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Big Numbers Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Revenue */}
          <div className="bg-secondary/30 border border-purple-500/30 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
            <div className="relative z-10">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</div>
              <div className="text-2xl lg:text-3xl font-mono font-bold text-success text-glow-success">
                $<CountUp end={revenueStats.totalRevenue} duration={2} separator="," />
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-secondary/30 border border-primary/20 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">This Month</div>
            <div className="text-xl lg:text-2xl font-mono font-bold text-foreground">
              $<CountUp end={revenueStats.thisMonth} duration={2} separator="," />
            </div>
            <div className={`text-xs flex items-center gap-1 mt-1 ${isPositiveChange ? 'text-success' : 'text-destructive'}`}>
              {isPositiveChange ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {percentChange}% vs last month
            </div>
          </div>

          {/* This Week */}
          <div className="bg-secondary/30 border border-primary/20 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">This Week</div>
            <div className="text-xl lg:text-2xl font-mono font-bold text-foreground">
              $<CountUp end={revenueStats.thisWeek} duration={2} separator="," />
            </div>
          </div>

          {/* Today */}
          <div className="bg-secondary/30 border border-success/30 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Today</div>
            <div className="text-xl lg:text-2xl font-mono font-bold text-success">
              $<CountUp end={revenueStats.today} duration={2} separator="," />
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-secondary/30 border border-primary/20 p-4">
          <h3 className="font-display text-sm font-bold tracking-wider text-muted-foreground mb-4">
            REVENUE (LAST 30 DAYS)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(180, 100%, 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(180, 100%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(180, 100%, 50%, 0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(0, 0%, 40%)" 
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(0, 0%, 40%)" 
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 4%)',
                    border: '1px solid hsl(180, 100%, 50%, 0.3)',
                    borderRadius: '2px',
                  }}
                  formatter={(value: number) => [`$${value}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(180, 100%, 50%)" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-secondary/30 border border-primary/20 p-4">
          <h3 className="font-display text-sm font-bold tracking-wider text-muted-foreground mb-4">
            RECENT TRANSACTIONS
          </h3>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-primary/10 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-success/10 border border-success/30 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{tx.businessName}</div>
                      <div className="text-xs text-muted-foreground">{tx.package}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-success font-mono font-bold">${tx.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">
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
          <div className="bg-secondary/30 border border-primary/20 p-3 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Deal</div>
            <div className="font-mono font-bold text-foreground">${avgDealSize.toFixed(0)}</div>
          </div>
          <div className="bg-secondary/30 border border-primary/20 p-3 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Close Rate</div>
            <div className="font-mono font-bold text-foreground">{closeRate}%</div>
          </div>
          <div className="bg-secondary/30 border border-warning/30 p-3 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Outstanding</div>
            <div className="font-mono font-bold text-warning">${pendingTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
