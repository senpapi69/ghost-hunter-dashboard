import { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { createBusiness } from '@/lib/airtable';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export function AddCustomerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    description: '',
    status: 'New Lead' as const,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      placeId: '',
      notes: '',
    });

    setIsSubmitting(false);

    if (result) {
      toast({
        title: 'Customer Added',
        description: `${formData.name} has been added to the CRM.`,
      });
      setFormData({
        name: '',
        phone: '',
        address: '',
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
    <div className="cyber-card h-full flex flex-col">
      <div className="p-4 border-b border-primary/30">
        <h2 className="font-display text-sm font-bold tracking-wider text-primary flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          ADD CUSTOMER
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">
            Business Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter business name"
            className="cyber-input"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">
            Phone Number *
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(555) 123-4567"
            className="cyber-input"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-xs uppercase tracking-wider text-muted-foreground">
            Address
          </Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main St, City, State"
            className="cyber-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the business..."
            className="cyber-input min-h-[80px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-xs uppercase tracking-wider text-muted-foreground">
            Status
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}
          >
            <SelectTrigger className="cyber-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-primary/30">
              <SelectItem value="New Lead">New Lead</SelectItem>
              <SelectItem value="Called">Called</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
              <SelectItem value="Built">Built</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-auto pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="cyber-button w-full h-12"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ADDING...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                ADD TO CRM
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
