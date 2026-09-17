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
import { useCreateCompany } from '@/hooks/useCompanies';
import { useCatalogItems } from '@/hooks/useCatalog';

const schema = z.object({
  razaoSocial: z.string().min(1, 'Informe a razão social'),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().optional(),
  segmentId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CompanyFormDialog({ trigger }: { trigger: React.ReactNode }) {
  const createCompany = useCreateCompany();
  const { data: segments } = useCatalogItems('segments');
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (createCompany.isSuccess) reset();
  }, [createCompany.isSuccess, reset]);

  const onSubmit = (values: FormValues) => {
    createCompany.mutate({
      razaoSocial: values.razaoSocial,
      nomeFantasia: values.nomeFantasia || undefined,
      cnpj: values.cnpj || undefined,
      segmentId: values.segmentId || undefined,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Empresa</DialogTitle>
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
          <DialogFooter>
            <Button type="submit" disabled={createCompany.isPending}>
              {createCompany.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
