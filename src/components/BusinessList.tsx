import { useQuery } from '@tanstack/react-query';
import { Phone, MapPin, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchBusinesses } from '@/lib/airtable';
import { Business } from '@/types/business';
import { StarRating } from './StarRating';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BusinessListProps {
  selectedId: string | null;
  onSelect: (business: Business) => void;
}

export function BusinessList({ selectedId, onSelect }: BusinessListProps) {
  const { data: businesses, isLoading, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses,
  });

  if (isLoading) {
    return (
      <div className="cyber-card h-full flex flex-col">
        <div className="p-4 border-b border-primary/30">
          <h2 className="font-display text-sm font-bold tracking-wider text-primary flex items-center gap-2">
            <span className="w-2 h-2 bg-primary animate-pulse" />
            TARGETS LOADING
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cyber-card h-full flex flex-col">
        <div className="p-4 border-b border-primary/30">
          <h2 className="font-display text-sm font-bold tracking-wider text-destructive">
            CONNECTION ERROR
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground text-sm text-center">
            Failed to connect to database. Check API configuration.
          </p>
        </div>
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="cyber-card h-full flex flex-col">
        <div className="p-4 border-b border-primary/30">
          <h2 className="font-display text-sm font-bold tracking-wider text-muted-foreground">
            NO TARGETS FOUND
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground text-sm text-center">
            No businesses in the database. Add one below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-primary/30 flex-shrink-0">
        <h2 className="font-display text-sm font-bold tracking-wider text-primary flex items-center gap-2">
          <span className="w-2 h-2 bg-primary animate-pulse" />
          TARGET LIST
          <span className="text-muted-foreground font-mono text-xs ml-auto">
            [{businesses.length}]
          </span>
        </h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="divide-y divide-primary/10">
          {businesses.map((business) => (
            <button
              key={business.id}
              onClick={() => onSelect(business)}
              className={cn(
                'w-full p-4 text-left transition-all duration-200 relative',
                'hover:bg-primary/5',
                selectedId === business.id && 'bg-primary/10'
              )}
            >
              {/* Active indicator */}
              <div
                className={cn(
                  'absolute left-0 top-0 bottom-0 w-1 transition-all duration-300',
                  selectedId === business.id
                    ? 'bg-primary glow-cyan'
                    : 'bg-transparent'
                )}
              />
              
              <div className="pl-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {business.rating === 5 && (
                      <Star className="h-4 w-4 fill-primary text-primary flex-shrink-0" />
                    )}
                    <span className="font-bold text-foreground">
                      {business.name}
                    </span>
                  </div>
                  <StarRating rating={business.rating} />
                </div>
                
                <a
                  href={`tel:${business.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 text-primary hover:text-glow transition-all mb-1"
                >
                  <Phone className="h-4 w-4" />
                  <span className="font-mono text-lg">{business.phone}</span>
                </a>
                
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span className="text-xs">{business.address}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
