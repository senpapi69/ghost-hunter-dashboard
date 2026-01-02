import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Map, ListOrdered, DollarSign } from 'lucide-react';
import { IntelligencePanel } from './IntelligencePanel';
import { MapPreview } from './MapPreview';
import { BuildQueue } from './BuildQueue';
import { RevenueDashboard } from './RevenueDashboard';
import { Business } from '@/types/business';

interface MainTabsProps {
  business: Business | null;
}

export function MainTabs({ business }: MainTabsProps) {
  return (
    <Tabs defaultValue="intel" className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-4 h-11 bg-card border-b border-primary/20 rounded-none">
        <TabsTrigger
          value="intel"
          className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none text-sm font-medium"
        >
          <Brain className="h-4 w-4 mr-2" />
          Intel
        </TabsTrigger>
        <TabsTrigger
          value="map"
          className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none text-sm font-medium"
        >
          <Map className="h-4 w-4 mr-2" />
          Map
        </TabsTrigger>
        <TabsTrigger
          value="queue"
          className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none text-sm font-medium"
        >
          <ListOrdered className="h-4 w-4 mr-2" />
          Queue
        </TabsTrigger>
        <TabsTrigger
          value="revenue"
          className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none text-sm font-medium"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Revenue
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

      <TabsContent value="revenue" className="flex-1 m-0 overflow-hidden">
        <RevenueDashboard />
      </TabsContent>
    </Tabs>
  );
}
