'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteCompany } from '@/hooks/useCompanies';
import type { Company } from '@/types/api';

interface DeleteCompanyDialogProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCompanyDialog({ company, open, onOpenChange }: DeleteCompanyDialogProps) {
  const deleteCompany = useDeleteCompany();

  const handleConfirm = () => {
    if (!company) return;
    deleteCompany.mutate(company.id, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir empresa</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir {company?.razaoSocial}? Contatos vinculados serão
            desvinculados e atividades registradas para esta empresa também serão removidas. Essa
            ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteCompany.isPending}
          >
            {deleteCompany.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
