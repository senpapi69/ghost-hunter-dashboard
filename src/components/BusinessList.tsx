import { useQuery } from '@tanstack/react-query';
import { Phone, MapPin, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchBusinesses } from '@/lib/airtable';
import { Business } from '@/types/business';
import { StarRating } from './StarRating';
import { StatusPill } from './StatusPill';
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
      <div className="h-full flex flex-col">
        <div className="p-3 border-b border-primary/20 flex-shrink-0">
          <h2 className="font-display text-xs font-bold tracking-wider text-primary flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary animate-pulse" />
            LOADING TARGETS...
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !businesses?.length) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 border-b border-primary/20">
          <h2 className="font-display text-xs font-bold tracking-wider text-muted-foreground">
            {error ? 'CONNECTION ERROR' : 'NO TARGETS'}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground text-xs text-center">
            {error ? 'Check API configuration' : 'Add a customer to get started'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-primary/20 flex-shrink-0">
        <h2 className="font-display text-xs font-bold tracking-wider text-primary flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary animate-pulse" />
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
                'w-full p-3 text-left transition-all duration-200 relative group',
                'hover:bg-primary/5',
                selectedId === business.id && 'bg-primary/10'
              )}
            >
              {/* Active indicator */}
              <div
                className={cn(
                  'absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-300',
                  selectedId === business.id
                    ? 'bg-primary glow-cyan'
                    : 'bg-transparent group-hover:bg-primary/30'
                )}
              />

              <div className="pl-2">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {business.rating === 5 && (
                      <Star className="h-3 w-3 fill-primary text-primary flex-shrink-0" />
                    )}
                    <span className="font-bold text-sm text-foreground truncate">
                      {business.name}
                    </span>
                  </div>
                  <StatusPill status={business.status} />
                </div>

                <a
                  href={`tel:${business.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-primary hover:text-glow transition-all mb-1"
                >
                  <Phone className="h-3 w-3" />
                  <span className="font-mono text-sm">{business.phone}</span>
                </a>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-1.5 text-muted-foreground flex-1 min-w-0">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span className="text-xs truncate">{business.address}</span>
                  </div>
                  <StarRating rating={business.rating} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
