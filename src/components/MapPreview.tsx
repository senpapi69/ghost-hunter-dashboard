import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { Business } from '@/types/business';
import { Button } from '@/components/ui/button';

interface MapPreviewProps {
  business: Business | null;
}

export function MapPreview({ business }: MapPreviewProps) {
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!business) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <MapPin className="h-12 w-12 text-muted-foreground/20 mb-3" />
        <p className="text-muted-foreground text-sm">
          Select a target to view location
        </p>
      </div>
    );
  }

  const encodedAddress = encodeURIComponent(business.address);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  // If we have a Place ID, use it for the embed
  const embedSrc = GOOGLE_MAPS_API_KEY
    ? business.placeId
      ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=place_id:${business.placeId}`
      : `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodedAddress}`
    : null;

  return (
    <div className="h-full flex flex-col">
      {/* Map Embed */}
      <div className="flex-1 relative bg-secondary/50 border-b border-primary/20">
        {embedSrc ? (
          <iframe
            src={embedSrc}
            className="absolute inset-0 w-full h-full"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <MapPin className="h-16 w-16 text-primary/20 mb-4" />
            <p className="text-muted-foreground text-sm text-center mb-2">
              Map preview requires API key
            </p>
            <p className="text-muted-foreground/60 text-xs text-center">
              Add VITE_GOOGLE_MAPS_API_KEY to enable
            </p>
          </div>
        )}
      </div>

      {/* Info Overlay */}
      <div className="p-3 bg-card border-t border-primary/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-foreground truncate">
              {business.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {business.address}
            </p>
            {business.placeId && (
              <p className="text-xs text-muted-foreground/50 mt-1 font-mono">
                ID: {business.placeId}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-shrink-0 border-primary/30 hover:bg-primary/10"
          >
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-3 w-3 mr-1" />
              Open
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
