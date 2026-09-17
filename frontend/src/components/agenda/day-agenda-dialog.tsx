'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  IconAlertTriangle,
  IconBuilding,
  IconCheck,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgendaFormDialog } from '@/components/agenda/agenda-form-dialog';
import { useDeleteActivity, useUpdateActivity } from '@/hooks/useActivities';
import { formatTime, formatWeekdayDate } from '@/lib/date';
import type { Activity } from '@/types/api';

const TYPE_LABELS: Record<string, string> = {
  task: 'Tarefa',
  meeting: 'Reunião',
};

interface DayAgendaDialogProps {
  date: Date | null;
  items: Activity[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DayAgendaDialog({ date, items, open, onOpenChange }: DayAgendaDialogProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();

  if (!date) return null;

  const handleComplete = (id: string) => {
    updateActivity.mutate({ id, payload: { completedAt: new Date().toISOString() } });
  };

  const handleDelete = (item: Activity) => {
    if (!window.confirm(`Remover "${item.title}" da agenda?`)) return;
    deleteActivity.mutate(item.id);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formatWeekdayDate(date)}</DialogTitle>
          </DialogHeader>

          <Button size="sm" className="w-fit" onClick={() => setCreateOpen(true)}>
            <IconPlus size={16} className="mr-1.5" /> Novo item
          </Button>

          <div className="flex flex-col gap-2">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum item neste dia.</p>
            )}
            {items.map((item) => {
              const isOverdue =
                !item.completedAt && item.dueAt && new Date(item.dueAt) < new Date();
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 rounded-md border p-3 ${isOverdue ? 'border-destructive/40' : 'border-border'}`}
                >
                  <button
                    type="button"
                    title={item.completedAt ? 'Concluído' : 'Marcar como concluído'}
                    onClick={() => !item.completedAt && handleComplete(item.id)}
                    disabled={!!item.completedAt}
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-input disabled:cursor-default disabled:border-accent-green disabled:bg-accent-green/10"
                  >
                    {item.completedAt && <IconCheck size={14} className="text-accent-green" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{TYPE_LABELS[item.type]}</Badge>
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.dueAt ? formatTime(item.dueAt) : ''}
                      </span>
                      <span
                        className={`text-sm font-medium ${item.completedAt ? 'text-muted-foreground line-through' : ''}`}
                      >
                        {item.title}
                      </span>
                      {isOverdue && (
                        <Badge variant="destructive" className="gap-1">
                          <IconAlertTriangle size={12} /> Atrasado
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {item.company && (
                        <Link
                          href={`/companies/${item.company.id}`}
                          className="flex items-center gap-1 hover:text-foreground hover:underline"
                        >
                          <IconBuilding size={12} /> {item.company.razaoSocial}
                        </Link>
                      )}
                      {item.deal && (
                        <Link
                          href={`/deals/${item.deal.id}`}
                          className="hover:text-foreground hover:underline"
                        >
                          {item.deal.title}
                        </Link>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    title="Remover"
                    onClick={() => handleDelete(item)}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <AgendaFormDialog open={createOpen} onOpenChange={setCreateOpen} defaultDate={date} />
    </>
  );
}
