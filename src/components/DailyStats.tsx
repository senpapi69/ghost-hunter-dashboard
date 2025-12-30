import { Users, Phone, TrendingUp, Rocket } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

export function DailyStats() {
  const { dailyStats } = useAppStore();

  const stats = [
    {
      label: 'Leads Today',
      value: dailyStats.leadsToday,
      icon: Users,
      color: 'text-primary',
    },
    {
      label: 'Calls Made',
      value: dailyStats.callsMade,
      icon: Phone,
      color: 'text-warning',
    },
    {
      label: 'Conversions',
      value: dailyStats.conversions,
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      label: 'Sites Built',
      value: dailyStats.sitesBuilt,
      icon: Rocket,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="border-t border-primary/20 p-3">
      <h3 className="font-display text-xs font-bold tracking-wider text-muted-foreground mb-3">
        TODAY'S STATS
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-secondary/50 border border-primary/10 p-2 text-center"
          >
            <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
            <div className={`font-mono text-xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
