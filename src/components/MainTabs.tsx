import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Map, DollarSign } from 'lucide-react';
import { IntelligencePanel } from './IntelligencePanel';
import { MapPreview } from './MapPreview';
import { RevenueDashboard } from './RevenueDashboard';
import { Business } from '@/types/business';

interface MainTabsProps {
  business: Business | null;
}

export function MainTabs({ business }: MainTabsProps) {
  return (
    <Tabs defaultValue="intel" className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-3 h-11 bg-card border-b border-border rounded-t-lg">
        <TabsTrigger
          value="intel"
          className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-sm font-medium"
        >
          <Brain className="h-4 w-4 mr-1.5" />
          Intel
        </TabsTrigger>
        <TabsTrigger
          value="map"
          className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-sm font-medium"
        >
          <Map className="h-4 w-4 mr-1.5" />
          Map
        </TabsTrigger>
        <TabsTrigger
          value="revenue"
          className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-sm font-medium"
        >
          <DollarSign className="h-4 w-4 mr-1.5" />
          Revenue
        </TabsTrigger>
      </TabsList>

      <TabsContent value="intel" className="flex-1 m-0 overflow-hidden">
        <IntelligencePanel business={business} />
      </TabsContent>

      <TabsContent value="map" className="flex-1 m-0 overflow-hidden">
        <MapPreview business={business} />
      </TabsContent>

      <TabsContent value="revenue" className="flex-1 m-0 overflow-hidden">
        <RevenueDashboard />
      </TabsContent>
    </Tabs>
  );
}
