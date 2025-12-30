import { useState } from 'react';
import { Header } from '@/components/Header';
import { BusinessList } from '@/components/BusinessList';
import { IntelligencePanel } from '@/components/IntelligencePanel';
import { WebsiteBuilder } from '@/components/WebsiteBuilder';
import { AddCustomerForm } from '@/components/AddCustomerForm';
import { Business } from '@/types/business';

const Index = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Header />
      
      <main className="h-[calc(100vh-3.5rem)] p-4">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Row */}
          <div className="h-[calc(50vh-3rem)] lg:h-[calc(50vh-2.5rem)]">
            <BusinessList
              selectedId={selectedBusiness?.id || null}
              onSelect={setSelectedBusiness}
            />
          </div>
          
          <div className="h-[calc(50vh-3rem)] lg:h-[calc(50vh-2.5rem)]">
            <IntelligencePanel business={selectedBusiness} />
          </div>
          
          {/* Bottom Row */}
          <div className="h-[calc(50vh-3rem)] lg:h-[calc(50vh-2.5rem)]">
            <WebsiteBuilder business={selectedBusiness} />
          </div>
          
          <div className="h-[calc(50vh-3rem)] lg:h-[calc(50vh-2.5rem)]">
            <AddCustomerForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
