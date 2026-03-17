import { Users, Phone, TrendingUp, Rocket } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

export function DailyStats() {
  const { dailyStats } = useAppStore();

  const stats = [
    {
      label: 'Leads Today',
      value: dailyStats.leadsToday,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Calls Made',
      value: dailyStats.callsMade,
      icon: Phone,
      color: 'text-amber-500',
    },
    {
      label: 'Conversions',
      value: dailyStats.conversions,
      icon: TrendingUp,
      color: 'text-emerald-500',
    },
    {
      label: 'Sites Built',
      value: dailyStats.sitesBuilt,
      icon: Rocket,
      color: 'text-violet-500',
    },
  ];

  return (
    <div className="border-t border-border p-4">
      <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3">
        Today's Stats
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-secondary/50 border border-border p-4 text-center rounded-lg hover:border-border/60 transition-colors"
          >
            <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
            <div className={`font-mono text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
