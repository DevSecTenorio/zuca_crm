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
import { useUpdateDeal } from '@/hooks/useDeals';
import { useContacts } from '@/hooks/useContacts';
import { useCompanies } from '@/hooks/useCompanies';
import { useUsers } from '@/hooks/useUsers';
import { useProducts } from '@/hooks/useProducts';
import type { Deal } from '@/types/api';

const schema = z.object({
  title: z.string().min(1, 'Informe o título'),
  value: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  expectedCloseDate: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  ownerId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function DealEditDialog({ deal, trigger }: { deal: Deal; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [productIds, setProductIds] = useState<string[]>([]);
  const updateDeal = useUpdateDeal();
  const { data: contacts } = useContacts();
  const { data: companies } = useCompanies();
  const { data: users } = useUsers();
  const { data: products } = useProducts();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        title: deal.title,
        value: deal.value ?? undefined,
        description: deal.description ?? '',
        expectedCloseDate: deal.expectedCloseDate ?? '',
        contactId: deal.contactId ?? undefined,
        companyId: deal.companyId ?? undefined,
        ownerId: deal.ownerId ?? undefined,
      });
      setProductIds(deal.products?.map((p) => p.id) ?? []);
    }
  }, [open, deal, reset]);

  const toggleProduct = (id: string) => {
    setProductIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const onSubmit = (values: FormValues) => {
    updateDeal.mutate(
      {
        id: deal.id,
        payload: {
          title: values.title,
          value: values.value,
          description: values.description || undefined,
          expectedCloseDate: values.expectedCloseDate || undefined,
          contactId: values.contactId || undefined,
          companyId: values.companyId || undefined,
          ownerId: values.ownerId || undefined,
          productIds,
        },
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Negociação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-title">Título</Label>
            <Input id="edit-title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-value">Valor (BRL)</Label>
              <Input id="edit-value" type="number" step="0.01" {...register('value')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-close-date">Previsão de fechamento</Label>
              <Input id="edit-close-date" type="date" {...register('expectedCloseDate')} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-description">Observações</Label>
            <Textarea id="edit-description" rows={3} {...register('description')} />
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
          <div className="flex flex-col gap-1.5">
            <Label>Responsável</Label>
            <Controller
              control={control}
              name="ownerId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Produtos e Serviços</Label>
            <div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-md border p-2">
              {products?.filter((p) => p.active).map((product) => (
                <label key={product.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={productIds.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                  />
                  {product.name}
                </label>
              ))}
              {products?.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhum produto cadastrado.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={updateDeal.isPending}>
              {updateDeal.isPending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
