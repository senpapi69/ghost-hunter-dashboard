import { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { createBusiness } from '@/lib/airtable';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/stores/appStore';
import { BusinessStatus } from '@/types/business';

export function AddCustomerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    placeId: '',
    description: '',
    status: 'New Lead' as BusinessStatus,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { incrementStat } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast({
        title: 'Validation Error',
        description: 'Business name and phone are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const result = await createBusiness({
      ...formData,
      rating: 0,
      notes: '',
      paid: false,
    });

    setIsSubmitting(false);

    if (result) {
      toast({
        title: 'Customer Added',
        description: `${formData.name} added to CRM`,
      });
      incrementStat('leadsToday');
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        placeId: '',
        description: '',
        status: 'New Lead',
      });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to add customer. Check API configuration.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
        <UserPlus className="h-4 w-4 text-primary" />
        <h3 className="font-display text-xs font-bold tracking-wider text-primary uppercase">
          Add to CRM
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Business Name *
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="cyber-input h-8 text-xs"
            required
          />
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Phone *
          </Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="cyber-input h-8 text-xs"
            required
          />
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Email
          </Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="cyber-input h-8 text-xs"
          />
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Address
          </Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="cyber-input h-8 text-xs"
          />
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Place ID
          </Label>
          <Input
            value={formData.placeId}
            onChange={(e) => setFormData({ ...formData, placeId: e.target.value })}
            className="cyber-input h-8 text-xs"
          />
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Description
          </Label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="cyber-input min-h-[50px] text-xs resize-none"
          />
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Status
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value as BusinessStatus })
            }
          >
            <SelectTrigger className="cyber-input h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-primary/30">
              <SelectItem value="New Lead">New Lead</SelectItem>
              <SelectItem value="Called">Called</SelectItem>
              <SelectItem value="Invoice Sent">Invoice Sent</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Built">Built</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="cyber-button w-full h-9 text-xs"
        >
          {isSubmitting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <UserPlus className="h-3 w-3 mr-1" />
              ADD CUSTOMER
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
