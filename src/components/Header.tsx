import { Ghost, Radio } from 'lucide-react';

export function Header() {
  return (
    <header className="h-14 border-b border-primary/30 bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Ghost className="h-8 w-8 text-primary animate-pulse-glow" />
        <h1 className="font-display text-xl font-bold tracking-widest text-primary text-glow">
          GHOST HUNTER
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            System Online
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Digital Ghost Hunter v1.0
        </span>
      </div>
    </header>
  );
}
