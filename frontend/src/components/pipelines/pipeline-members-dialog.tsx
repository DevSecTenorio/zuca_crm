'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Pipeline } from '@/types/api';
import { useUsers } from '@/hooks/useUsers';
import { usePipelineMembers, useSetPipelineMembers } from '@/hooks/usePipelines';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  rep: 'Rep',
};

export function PipelineMembersDialog({
  pipeline,
  open,
  onOpenChange,
}: {
  pipeline: Pipeline | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: users } = useUsers();
  const { data: members } = usePipelineMembers(open ? pipeline?.id : undefined);
  const setMembers = useSetPipelineMembers();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (members) {
      setSelected(new Set(members.map((m) => m.userId)));
    }
  }, [members]);

  if (!pipeline) return null;

  const toggle = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSave = () => {
    setMembers.mutate(
      { pipelineId: pipeline.id, memberIds: [...selected] },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Membros de &quot;{pipeline.name}&quot;</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Apenas admins e managers enxergam todos os funis. Reps só veem os funis em que forem
          adicionados aqui.
        </p>
        <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
          {users?.map((user) => (
            <label
              key={user.id}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
            >
              <span className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</span>
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={selected.has(user.id)}
                  onChange={() => toggle(user.id)}
                />
              </span>
            </label>
          ))}
          {users?.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum usuário na organização.</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={setMembers.isPending}>
            {setMembers.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
