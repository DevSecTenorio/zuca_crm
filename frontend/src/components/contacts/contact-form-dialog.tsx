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
import { useCreateContact, useUpdateContact } from '@/hooks/useContacts';
import { useCatalogItems } from '@/hooks/useCatalog';
import type { Contact } from '@/types/api';

const schema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  sourceId: z.string().optional(),
  campaignId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ContactFormDialogProps {
  trigger?: React.ReactNode;
  contact?: Contact;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ContactFormDialog({
  trigger,
  contact,
  open,
  onOpenChange,
}: ContactFormDialogProps) {
  const isEditMode = !!contact;
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const { data: sources } = useCatalogItems('lead-sources');
  const { data: campaigns } = useCatalogItems('campaigns');
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open === undefined) return;
    if (open) {
      reset({
        name: contact?.name ?? '',
        email: contact?.email ?? '',
        phone: contact?.phone ?? '',
        sourceId: contact?.sourceId ?? undefined,
        campaignId: contact?.campaignId ?? undefined,
      });
    }
  }, [open, contact, reset]);

  useEffect(() => {
    if (createContact.isSuccess) {
      reset();
    }
  }, [createContact.isSuccess, reset]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      sourceId: values.sourceId || undefined,
      campaignId: values.campaignId || undefined,
    };

    if (isEditMode) {
      updateContact.mutate(
        { id: contact.id, payload },
        { onSuccess: () => onOpenChange?.(false) },
      );
    } else {
      createContact.mutate(payload);
    }
  };

  const isPending = isEditMode ? updateContact.isPending : createContact.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Acme Corp" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="contact@acme.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="(11) 98765-4321" {...register('phone')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Fonte</Label>
            <Controller
              control={control}
              name="sourceId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources?.filter((s) => s.active).map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Campanha</Label>
            <Controller
              control={control}
              name="campaignId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma campanha" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns?.filter((c) => c.active).map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
