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
    <header className="h-14 border-b border-primary/20 bg-card/90 backdrop-blur-md flex items-center justify-between px-6 relative z-50">
      {/* Scanline overlay - reduced */}
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />

      {/* Left - Logo */}
      <div className="flex items-center gap-3 relative z-10">
        <Ghost className="h-5 w-5 text-primary" />
        <h1 className="font-display text-base font-bold tracking-wide text-primary">
          Ghost Hunter
        </h1>
      </div>

      {/* Center - Time */}
      <div className="flex items-center gap-3 text-muted-foreground relative z-10">
        <Clock className="h-4 w-4" />
        <span className="font-mono text-sm">
          {format(currentTime, 'EEE, MMM d yyyy')}
        </span>
        <span className="font-mono text-sm text-primary font-medium">
          {format(currentTime, 'HH:mm:ss')}
        </span>
      </div>

      {/* Right - Status */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-sm" />
          <span className="text-xs text-muted-foreground tracking-wide">
            Online
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono border border-primary/20 px-3 py-1.5 rounded-md bg-card/50">
          v2.0
        </span>
      </div>
    </header>
  );
}
