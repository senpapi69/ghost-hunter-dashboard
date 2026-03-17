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
        <div className="p-4 border-b border-border flex-shrink-0">
          <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
            Loading Targets...
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !businesses?.length) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-sm font-semibold text-muted-foreground">
            {error ? 'Connection Error' : 'No Targets'}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground text-sm text-center">
            {error ? 'Check API configuration' : 'Add a customer to get started'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex-shrink-0">
        <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
          Target List
          <span className="text-muted-foreground font-mono text-xs ml-auto bg-secondary border border-border px-2 py-0.5 rounded-md">
            {businesses.length}
          </span>
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y divide-border/50">
          {businesses.map((business) => (
            <button
              key={business.id}
              onClick={() => onSelect(business)}
              className={cn(
                'w-full p-4 text-left transition-all duration-200 relative group',
                'hover:bg-muted/50',
                selectedId === business.id && 'bg-muted'
              )}
            >
              {/* Active indicator */}
              <div
                className={cn(
                  'absolute left-0 top-0 bottom-0 w-1 rounded-r transition-all duration-200',
                  selectedId === business.id
                    ? 'bg-primary'
                    : 'bg-transparent group-hover:bg-border/50'
                )}
              />

              <div className="pl-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {business.rating === 5 && (
                      <Star className="h-3.5 w-3.5 fill-warning text-warning flex-shrink-0" />
                    )}
                    <span className="font-semibold text-sm text-foreground truncate">
                      {typeof business.name === 'string' ? business.name : String(business.name || 'Unknown')}
                    </span>
                  </div>
                  <StatusPill status={business.status} />
                </div>

                <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs">{typeof business.phone === 'string' ? business.phone : String(business.phone || '')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-2 text-muted-foreground flex-1 min-w-0">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span className="text-xs truncate">{typeof business.address === 'string' ? business.address : String(business.address || '')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">{business.rating}</span>
                    <StarRating rating={business.rating} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
