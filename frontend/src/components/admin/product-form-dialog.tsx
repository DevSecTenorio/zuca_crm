'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import type { Product } from '@/types/api';

const schema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  description: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  sku: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProductFormDialog({
  trigger,
  product,
}: {
  trigger: React.ReactNode;
  product?: Product;
}) {
  const [open, setOpen] = useState(false);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEditing = !!product;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        name: product?.name ?? '',
        description: product?.description ?? '',
        price: product?.price ?? undefined,
        sku: product?.sku ?? '',
      });
    }
  }, [open, product, reset]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      price: values.price,
      sku: values.sku || undefined,
    };
    if (isEditing) {
      updateProduct.mutate(
        { id: product.id, payload },
        { onSuccess: () => setOpen(false) },
      );
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      });
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Produto/Serviço' : 'Novo Produto/Serviço'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="product-name">Nome</Label>
            <Input id="product-name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-price">Preço (BRL)</Label>
              <Input id="product-price" type="number" step="0.01" {...register('price')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-sku">SKU</Label>
              <Input id="product-sku" {...register('sku')} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="product-description">Descrição</Label>
            <Textarea id="product-description" rows={3} {...register('description')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar Produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
