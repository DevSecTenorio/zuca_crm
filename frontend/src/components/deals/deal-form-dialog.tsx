'use client';

import { useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateDeal } from '@/hooks/useDeals';
import { useContacts } from '@/hooks/useContacts';
import { useCompanies } from '@/hooks/useCompanies';

const schema = z.object({
  title: z.string().min(1, 'Informe o título'),
  value: z.coerce.number().min(0).optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function DealFormDialog({
  trigger,
  pipelineId,
}: {
  trigger: React.ReactNode;
  pipelineId: string;
}) {
  const createDeal = useCreateDeal();
  const { data: contacts } = useContacts();
  const { data: companies } = useCompanies();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (createDeal.isSuccess) reset();
  }, [createDeal.isSuccess, reset]);

  const onSubmit = (values: FormValues) => {
    createDeal.mutate({
      title: values.title,
      value: values.value,
      pipelineId,
      contactId: values.contactId || undefined,
      companyId: values.companyId || undefined,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Negociação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Venda Q4 2026" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="value">Valor (BRL)</Label>
            <Input id="value" type="number" step="0.01" placeholder="50000" {...register('value')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Contato</Label>
            <Controller
              control={control}
              name="contactId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um contato" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts?.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
          <DialogFooter>
            <Button type="submit" disabled={createDeal.isPending}>
              {createDeal.isPending ? 'Criando...' : 'Criar Negociação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
