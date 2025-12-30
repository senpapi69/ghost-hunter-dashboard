import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Map, ListOrdered } from 'lucide-react';
import { IntelligencePanel } from './IntelligencePanel';
import { MapPreview } from './MapPreview';
import { BuildQueue } from './BuildQueue';
import { Business } from '@/types/business';

interface MainTabsProps {
  business: Business | null;
}

export function MainTabs({ business }: MainTabsProps) {
  return (
    <Tabs defaultValue="intel" className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-3 h-10 bg-card border-b border-primary/20 rounded-none">
        <TabsTrigger
          value="intel"
          className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none text-xs"
        >
          <Brain className="h-3 w-3 mr-1.5" />
          Intel
        </TabsTrigger>
        <TabsTrigger
          value="map"
          className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none text-xs"
        >
          <Map className="h-3 w-3 mr-1.5" />
          Map
        </TabsTrigger>
        <TabsTrigger
          value="queue"
          className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none text-xs"
        >
          <ListOrdered className="h-3 w-3 mr-1.5" />
          Queue
        </TabsTrigger>
      </TabsList>

      <TabsContent value="intel" className="flex-1 m-0 overflow-hidden">
        <IntelligencePanel business={business} />
      </TabsContent>

      <TabsContent value="map" className="flex-1 m-0 overflow-hidden">
        <MapPreview business={business} />
      </TabsContent>

      <TabsContent value="queue" className="flex-1 m-0 overflow-hidden">
        <BuildQueue />
      </TabsContent>
    </Tabs>
  );
}
