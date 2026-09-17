'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateActivity } from '@/hooks/useActivities';
import { useCompanies } from '@/hooks/useCompanies';
import { useAllDeals } from '@/hooks/useDeals';
import { toLocalDatetimeInputValue } from '@/lib/date';

const schema = z.object({
  type: z.enum(['task', 'meeting']),
  title: z.string().min(1, 'Informe o título'),
  dueAt: z.string().min(1, 'Informe data e hora'),
  description: z.string().optional(),
  companyId: z.string().optional(),
  dealId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AgendaFormDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultDate?: Date;
  defaultCompanyId?: string;
  defaultDealId?: string;
}

export function AgendaFormDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  defaultDate,
  defaultCompanyId,
  defaultDealId,
}: AgendaFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const createActivity = useCreateActivity();
  const { data: companies } = useCompanies();
  const { data: deals } = useAllDeals();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'task' },
  });

  useEffect(() => {
    if (open) {
      reset({
        type: 'task',
        title: '',
        dueAt: defaultDate ? toLocalDatetimeInputValue(defaultDate) : '',
        description: '',
        companyId: defaultCompanyId,
        dealId: defaultDealId,
      });
    }
  }, [open, reset, defaultDate, defaultCompanyId, defaultDealId]);

  const onSubmit = (values: FormValues) => {
    createActivity.mutate(
      {
        type: values.type,
        title: values.title,
        description: values.description || undefined,
        dueAt: new Date(values.dueAt).toISOString(),
        companyId: values.companyId || undefined,
        dealId: values.dealId || undefined,
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo item na agenda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Tarefa</SelectItem>
                    <SelectItem value="meeting">Reunião</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="agenda-title">Título</Label>
            <Input id="agenda-title" placeholder="Ligar para o cliente" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="agenda-due">Data e hora</Label>
            <Input id="agenda-due" type="datetime-local" {...register('dueAt')} />
            {errors.dueAt && <p className="text-sm text-destructive">{errors.dueAt.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="agenda-description">Observações</Label>
            <Textarea id="agenda-description" rows={3} {...register('description')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Empresa</Label>
            <Controller
              control={control}
              name="companyId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.razaoSocial}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Negociação</Label>
            <Controller
              control={control}
              name="dealId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma negociação" />
                  </SelectTrigger>
                  <SelectContent>
                    {deals?.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        {deal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createActivity.isPending}>
              {createActivity.isPending ? 'Salvando...' : 'Adicionar à agenda'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
