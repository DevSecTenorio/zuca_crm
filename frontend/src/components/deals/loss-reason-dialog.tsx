'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCatalogItems } from '@/hooks/useCatalog';

export function LossReasonDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lossReasonId?: string) => void;
}) {
  const { data: reasons } = useCatalogItems('loss-reasons');
  const [reasonId, setReasonId] = useState<string | undefined>(undefined);

  const handleConfirm = () => {
    onConfirm(reasonId);
    onOpenChange(false);
    setReasonId(undefined);
  };

  const handleSkip = () => {
    onConfirm(undefined);
    onOpenChange(false);
    setReasonId(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Motivo da perda</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Por que essa negociação foi perdida? Isso ajuda a identificar padrões no seu pipeline.
        </p>
        <Select value={reasonId} onValueChange={setReasonId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um motivo (opcional)" />
          </SelectTrigger>
          <SelectContent>
            {reasons?.filter((r) => r.active).map((reason) => (
              <SelectItem key={reason.id} value={reason.id}>
                {reason.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={handleSkip}>
            Pular
          </Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
