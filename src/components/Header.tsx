import { Ghost, Radio, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 relative z-50">
      {/* Left - Logo */}
      <div className="flex items-center gap-3">
        <Ghost className="h-5 w-5 text-primary" />
        <h1 className="font-display text-base font-bold text-foreground">
          Ghost Hunter
        </h1>
      </div>

      {/* Center - Time */}
      <div className="flex items-center gap-3 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="font-mono text-sm">
          {format(currentTime, 'EEE, MMM d yyyy')}
        </span>
        <span className="font-mono text-sm text-foreground font-medium">
          {format(currentTime, 'HH:mm:ss')}
        </span>
      </div>

      {/* Right - Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success shadow-sm" />
          <span className="text-xs text-muted-foreground">
            Online
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono border border-border px-3 py-1.5 rounded-md bg-secondary">
          v2.0
        </span>
      </div>
    </header>
  );
}
