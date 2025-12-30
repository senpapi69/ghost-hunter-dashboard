import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { BusinessList } from '@/components/BusinessList';
import { DailyStats } from '@/components/DailyStats';
import { MainTabs } from '@/components/MainTabs';
import { DeployInvoice } from '@/components/DeployInvoice';
import { CallLog } from '@/components/CallLog';
import { QuickOutreach } from '@/components/QuickOutreach';
import { AddCustomerForm } from '@/components/AddCustomerForm';
import { useAppStore } from '@/stores/appStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { fetchBusinesses } from '@/lib/airtable';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

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

      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - Resizable */}
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={35}
            className="bg-card/50"
          >
            <div className="h-full flex flex-col overflow-hidden border-r border-primary/20">
              <div className="flex-1 overflow-hidden">
                <BusinessList
                  selectedId={selectedBusiness?.id || null}
                  onSelect={setSelectedBusiness}
                />
              </div>
              <DailyStats />
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-primary/10 hover:bg-primary/30 transition-colors data-[resize-handle-active]:bg-primary/50" />

          {/* Main Content */}
          <ResizablePanel defaultSize={55} minSize={30}>
            <div className="h-full bg-card/30 overflow-hidden">
              <MainTabs business={selectedBusiness} />
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-primary/10 hover:bg-primary/30 transition-colors data-[resize-handle-active]:bg-primary/50" />

          {/* Right Sidebar - Resizable */}
          <ResizablePanel
            defaultSize={25}
            minSize={18}
            maxSize={35}
            className="bg-card/50"
          >
            <div className="h-full border-l border-primary/20 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="divide-y divide-primary/10">
                  <DeployInvoice business={selectedBusiness} />
                  <CallLog business={selectedBusiness} />
                  <QuickOutreach business={selectedBusiness} />
                  <AddCustomerForm business={selectedBusiness} />
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      {/* Keyboard shortcuts hint */}
      <footer className="h-6 border-t border-primary/20 bg-card/80 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span>
          <kbd className="bg-muted px-1 mx-0.5">↑</kbd>
          <kbd className="bg-muted px-1 mx-0.5">↓</kbd>
          Navigate
        </span>
        <span>
          <kbd className="bg-muted px-1 mx-0.5">D</kbd>
          Deploy
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
