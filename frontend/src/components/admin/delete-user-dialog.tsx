'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteUser } from '@/hooks/useUsers';
import type { OrgUser } from '@/api/users';

export function DeleteUserDialog({ user, trigger }: { user: OrgUser; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const deleteUser = useDeleteUser();

  const handleConfirm = () => {
    deleteUser.mutate(user.id, { onSuccess: () => setOpen(false) });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir usuário</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir &quot;{user.name}&quot;? Negociações e atividades
            atribuídas a ele permanecerão, mas sem responsável. Essa ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleteUser.isPending}>
            {deleteUser.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
