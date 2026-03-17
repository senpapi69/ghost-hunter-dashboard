import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { BusinessList } from '@/components/BusinessList';
import { DailyStats } from '@/components/DailyStats';
import { MainTabs } from '@/components/MainTabs';
import { DeployInvoice } from '@/components/DeployInvoice';
import { CallLog } from '@/components/CallLog';
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
      <Header />

      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - Resizable */}
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={35}
            className="bg-sidebar"
          >
            <div className="h-full flex flex-col overflow-hidden border-r border-border">
              <div className="flex-1 overflow-hidden">
                <BusinessList
                  selectedId={selectedBusiness?.id || null}
                  onSelect={setSelectedBusiness}
                />
              </div>
              <DailyStats />
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-border hover:bg-border/60 transition-colors data-[resize-handle-active]:bg-border" />

          {/* Main Content */}
          <ResizablePanel defaultSize={55} minSize={30}>
            <div className="h-full bg-background overflow-hidden">
              <MainTabs business={selectedBusiness} />
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-border hover:bg-border/60 transition-colors data-[resize-handle-active]:bg-border" />

          {/* Right Sidebar - Resizable */}
          <ResizablePanel
            defaultSize={25}
            minSize={18}
            maxSize={35}
            className="bg-card"
          >
            <div className="h-full border-l border-border overflow-hidden">
              <ScrollArea className="h-full">
                <div className="divide-y divide-border/50">
                  <DeployInvoice business={selectedBusiness} />
                  <CallLog business={selectedBusiness} />
                  <AddCustomerForm business={selectedBusiness} />
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      {/* Keyboard shortcuts hint */}
      <footer className="h-8 border-t border-border bg-card/50 backdrop-blur-sm flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px]">↑</kbd>
          <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px]">↓</kbd>
          <span className="ml-1">Navigate</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px]">D</kbd>
          <span className="ml-1">Deploy</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px]">C</kbd>
          <span className="ml-1">Call Log</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px]">N</kbd>
          <span className="ml-1">New Customer</span>
        </span>
      </footer>
    </div>
  );
};

export default Index;
