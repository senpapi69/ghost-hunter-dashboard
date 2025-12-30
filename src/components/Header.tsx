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
    <header className="h-12 border-b border-primary/20 bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 relative z-50">
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />
      
      {/* Left - Logo */}
      <div className="flex items-center gap-2 relative z-10">
        <Ghost className="h-6 w-6 text-primary pulse-glow" />
        <h1 className="font-display text-lg font-bold tracking-widest text-primary text-glow">
          GHOST HUNTER
        </h1>
      </div>

      {/* Center - Time */}
      <div className="flex items-center gap-2 text-muted-foreground relative z-10">
        <Clock className="h-4 w-4" />
        <span className="font-mono text-sm">
          {format(currentTime, 'EEE, MMM d yyyy')}
        </span>
        <span className="font-mono text-sm text-primary">
          {format(currentTime, 'HH:mm:ss')}
        </span>
      </div>

      {/* Right - Status */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Online
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono border border-primary/20 px-2 py-1">
          Command Center v2.0
        </span>
      </div>
    </header>
  );
}
