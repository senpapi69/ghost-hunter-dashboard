import { Users, Phone, TrendingUp, Rocket } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

export function DailyStats() {
  const { dailyStats } = useAppStore();

  const stats = [
    {
      label: 'Leads Today',
      value: dailyStats.leadsToday,
      icon: Users,
      valueClass: 'text-primary',
    },
    {
      label: 'Calls Made',
      value: dailyStats.callsMade,
      icon: Phone,
      valueClass: 'text-warning',
    },
    {
      label: 'Conversions',
      value: dailyStats.conversions,
      icon: TrendingUp,
      valueClass: 'text-success',
    },
    {
      label: 'Sites Built',
      value: dailyStats.sitesBuilt,
      icon: Rocket,
      valueClass: 'text-muted-foreground',
    },
  ];

  return (
    <div className="border-t border-border p-4">
      <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Today
      </h3>
      <div className="space-y-1">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between py-1"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <stat.icon className="h-3.5 w-3.5" />
              <span className="text-xs">{stat.label}</span>
            </div>
            <span className={`font-mono text-sm font-semibold ${stat.valueClass}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
