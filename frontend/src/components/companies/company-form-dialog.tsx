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
import { useCreateCompany, useUpdateCompany } from '@/hooks/useCompanies';
import { useCatalogItems } from '@/hooks/useCatalog';
import type { Company } from '@/types/api';

const schema = z.object({
  razaoSocial: z.string().min(1, 'Informe a razão social'),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().optional(),
  segmentId: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CompanyFormDialogProps {
  trigger?: React.ReactNode;
  company?: Company;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CompanyFormDialog({
  trigger,
  company,
  open,
  onOpenChange,
}: CompanyFormDialogProps) {
  const isEditMode = !!company;
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const { data: segments } = useCatalogItems('segments');
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
        razaoSocial: company?.razaoSocial ?? '',
        nomeFantasia: company?.nomeFantasia ?? '',
        cnpj: company?.cnpj ?? '',
        segmentId: company?.segmentId ?? undefined,
        website: company?.website ?? '',
        phone: company?.phone ?? '',
        email: company?.email ?? '',
        cep: company?.address?.cep ?? '',
        logradouro: company?.address?.logradouro ?? '',
        numero: company?.address?.numero ?? '',
        complemento: company?.address?.complemento ?? '',
        bairro: company?.address?.bairro ?? '',
        cidade: company?.address?.cidade ?? '',
        estado: company?.address?.estado ?? '',
      });
    }
  }, [open, company, reset]);

  useEffect(() => {
    if (createCompany.isSuccess) reset();
  }, [createCompany.isSuccess, reset]);

  const onSubmit = (values: FormValues) => {
    const address = {
      cep: values.cep || undefined,
      logradouro: values.logradouro || undefined,
      numero: values.numero || undefined,
      complemento: values.complemento || undefined,
      bairro: values.bairro || undefined,
      cidade: values.cidade || undefined,
      estado: values.estado || undefined,
    };
    const hasAddress = Object.values(address).some(Boolean);

    const payload = {
      razaoSocial: values.razaoSocial,
      nomeFantasia: values.nomeFantasia || undefined,
      cnpj: values.cnpj || undefined,
      segmentId: values.segmentId || undefined,
      website: values.website || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      address: hasAddress ? address : undefined,
    };

    if (isEditMode) {
      updateCompany.mutate(
        { id: company.id, payload },
        { onSuccess: () => onOpenChange?.(false) },
      );
    } else {
      createCompany.mutate(payload);
    }
  };

  const isPending = isEditMode ? updateCompany.isPending : createCompany.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="razaoSocial">Razão Social</Label>
            <Input id="razaoSocial" placeholder="Acme Ltda" {...register('razaoSocial')} />
            {errors.razaoSocial && (
              <p className="text-sm text-destructive">{errors.razaoSocial.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
            <Input id="nomeFantasia" placeholder="Acme" {...register('nomeFantasia')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" placeholder="00.000.000/0001-00" {...register('cnpj')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Segmento</Label>
            <Controller
              control={control}
              name="segmentId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments?.filter((s) => s.active).map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="border-t pt-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Contato</p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@acme.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(11) 98765-4321" {...register('phone')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="website">Site</Label>
                <Input
                  id="website"
                  placeholder="https://acme.com"
                  {...register('website')}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Endereço</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" placeholder="00000-000" {...register('cep')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" placeholder="123" {...register('numero')} />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input id="logradouro" placeholder="Av. Paulista" {...register('logradouro')} />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="complemento">Complemento</Label>
                <Input id="complemento" placeholder="Sala 45" {...register('complemento')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bairro">Bairro</Label>
                <Input id="bairro" placeholder="Centro" {...register('bairro')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" placeholder="São Paulo" {...register('cidade')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="estado">Estado</Label>
                <Input id="estado" placeholder="SP" maxLength={2} {...register('estado')} />
              </div>
            </div>
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
