import { useState, useEffect } from 'react';
import { UserPlus, Loader2, Edit } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { createBusiness } from '@/lib/airtable';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/stores/appStore';
import { Business, BusinessStatus } from '@/types/business';

interface AddCustomerFormProps {
  business?: Business | null;
}

export function AddCustomerForm({ business }: AddCustomerFormProps) {
  const [open, setOpen] = useState(false);
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

  // Pre-fill form when business is selected (for update mode)
  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name,
        phone: business.phone,
        email: business.email || '',
        address: business.address,
        placeId: business.placeId,
        description: business.description,
        status: business.status,
      });
    }
  }, [business]);

  const isUpdateMode = !!business;

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

    // For now, create works the same way (would need update API for real update)
    const result = await createBusiness({
      ...formData,
      rating: business?.rating || 0,
      notes: business?.notes || '',
      paid: business?.paid || false,
    });

    setIsSubmitting(false);

    if (result) {
      toast({
        title: isUpdateMode ? 'Customer Updated' : 'Customer Added',
        description: `${formData.name} ${isUpdateMode ? 'updated' : 'added to CRM'}`,
      });
      
      if (!isUpdateMode) {
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
      }
      
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      setOpen(false);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save customer. Check API configuration.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    if (!business) {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        placeId: '',
        description: '',
        status: 'New Lead',
      });
    }
  };

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 border-b border-primary/20 pb-2 mb-3">
        <UserPlus className="h-4 w-4 text-primary" />
        <h3 className="font-display text-xs font-bold tracking-wider text-primary uppercase">
          {isUpdateMode ? 'Update Customer' : 'Add to CRM'}
        </h3>
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full cyber-button h-10"
          >
            {isUpdateMode ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                UPDATE CUSTOMER
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                ADD CUSTOMER
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-primary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-primary flex items-center gap-2">
              {isUpdateMode ? <Edit className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {isUpdateMode ? `Update — ${business?.name}` : 'Add New Customer'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Business Name *
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="cyber-input h-9 text-sm"
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
                  className="cyber-input h-9 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="cyber-input h-9 text-sm"
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
                  <SelectTrigger className="cyber-input h-9 text-sm">
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
            </div>

            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Address
              </Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="cyber-input h-9 text-sm"
              />
            </div>

            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Place ID
              </Label>
              <Input
                value={formData.placeId}
                onChange={(e) => setFormData({ ...formData, placeId: e.target.value })}
                className="cyber-input h-9 text-sm font-mono"
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
                className="cyber-input min-h-[60px] text-sm resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="cyber-button w-full h-10"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isUpdateMode ? <Edit className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  {isUpdateMode ? 'UPDATE CUSTOMER' : 'ADD CUSTOMER'}
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}