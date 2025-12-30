import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { BusinessList } from '@/components/BusinessList';
import { DailyStats } from '@/components/DailyStats';
import { MainTabs } from '@/components/MainTabs';
import { WebsiteBuilder } from '@/components/WebsiteBuilder';
import { CallLog } from '@/components/CallLog';
import { QuickOutreach } from '@/components/QuickOutreach';
import { AddCustomerForm } from '@/components/AddCustomerForm';
import { useAppStore } from '@/stores/appStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { fetchBusinesses } from '@/lib/airtable';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  const { selectedBusiness, setSelectedBusiness } = useAppStore();
  
  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses,
  });

  useKeyboardShortcuts({
    businesses,
    selectedBusiness,
    onSelectBusiness: setSelectedBusiness,
  });

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
      {/* Scanline overlay */}
      <div className="fixed inset-0 scanlines pointer-events-none z-50" />
      
      <Header />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 border-r border-primary/20 bg-card/50 flex flex-col overflow-hidden flex-shrink-0">
          <div className="flex-1 overflow-hidden">
            <BusinessList
              selectedId={selectedBusiness?.id || null}
              onSelect={setSelectedBusiness}
            />
          </div>
          <DailyStats />
        </aside>

        {/* Main Content */}
        <div className="flex-1 bg-card/30 overflow-hidden">
          <MainTabs business={selectedBusiness} />
        </div>

        {/* Right Sidebar */}
        <aside className="w-72 border-l border-primary/20 bg-card/50 flex-shrink-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="divide-y divide-primary/10">
              <WebsiteBuilder business={selectedBusiness} />
              <CallLog business={selectedBusiness} />
              <QuickOutreach business={selectedBusiness} />
              <AddCustomerForm />
            </div>
          </ScrollArea>
        </aside>
      </main>

      {/* Keyboard shortcuts hint */}
      <footer className="h-6 border-t border-primary/20 bg-card/80 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span>
          <kbd className="bg-muted px-1 mx-0.5">↑</kbd>
          <kbd className="bg-muted px-1 mx-0.5">↓</kbd>
          Navigate
        </span>
        <span>
          <kbd className="bg-muted px-1 mx-0.5">B</kbd>
          Build
        </span>
        <span>
          <kbd className="bg-muted px-1 mx-0.5">C</kbd>
          Call Log
        </span>
        <span>
          <kbd className="bg-muted px-1 mx-0.5">N</kbd>
          New Customer
        </span>
      </footer>
    </div>
  );
};

export default Index;
