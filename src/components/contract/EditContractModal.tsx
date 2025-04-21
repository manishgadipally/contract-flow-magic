
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: unknown) => void;
  section: {
    type: 'from' | 'to' | 'place' | 'duration' | 'rate';
    title: string;
    data: unknown;
  };
}

const EditContractModal = ({ isOpen, onClose, onSave, section }: EditContractModalProps) => {
  const [formData, setFormData] = React.useState<{
    name?: string;
    email?: string;
    placeOfService?: string;
    startDate?: string;
    endDate?: string;
    rate?: string;
  }>({});

  // Update form data when section data changes or modal opens
  useEffect(() => {
    if (isOpen && section && section.data) {
      setFormData(section.data);
    }
  }, [isOpen, section]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const renderFields = () => {
    if (!section || !formData) return null;

    switch (section.type) {
      case 'from':
      case 'to':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </>
        );
      case 'place':
        return (
          <div className="space-y-2">
            <Label htmlFor="placeOfService">Place of Service</Label>
            <Textarea
              id="placeOfService"
              value={formData.placeOfService || ''}
              onChange={(e) => setFormData({ ...formData, placeOfService: e.target.value })}
            />
          </div>
        );
      case 'duration':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </>
        );
      case 'rate':
        return (
          <div className="space-y-2">
            <Label htmlFor="rate">Contract Rate</Label>
            <Input
              id="rate"
              value={formData.rate || ''}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {section?.title || 'Contract Details'}</DialogTitle>
          <DialogDescription>
            Make changes to the contract details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {renderFields()}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContractModal;
