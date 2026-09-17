'use client';

import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductFormDialog } from '@/components/admin/product-form-dialog';
import { useProducts, useRemoveProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useAuthStore } from '@/store/auth-store';
import { formatCurrencyBRL } from '@/lib/format';

export default function ProductsAdminPage() {
  const user = useAuthStore((s) => s.user);
  const { data: products, isLoading } = useProducts();
  const updateProduct = useUpdateProduct();
  const removeProduct = useRemoveProduct();

  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <p className="text-sm text-muted-foreground">Acesso restrito.</p>;
  }

  const handleRemove = (id: string, name: string) => {
    if (!window.confirm(`Remover "${name}"?`)) return;
    removeProduct.mutate(id);
  };

  return (
    <div>
      <PageHeader
        title="Produtos e Serviços"
        description="Catálogo usado para vincular itens vendidos às negociações"
        actions={
          <ProductFormDialog
            trigger={
              <Button>
                <IconPlus size={16} className="mr-1.5" /> Novo Produto
              </Button>
            }
          />
        }
      />

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex flex-col gap-2 pt-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{product.name}</p>
                  {product.sku && (
                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  )}
                </div>
                {!product.active && <Badge variant="secondary">Inativo</Badge>}
              </div>
              {product.price != null && (
                <p className="text-sm font-semibold text-primary">
                  {formatCurrencyBRL(product.price)}
                </p>
              )}
              {product.description && (
                <p className="text-sm text-muted-foreground">{product.description}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <ProductFormDialog
                  product={product}
                  trigger={
                    <Button variant="outline" size="sm">
                      <IconPencil size={14} className="mr-1" /> Editar
                    </Button>
                  }
                />
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={product.active}
                    onChange={(e) =>
                      updateProduct.mutate({
                        id: product.id,
                        payload: { active: e.target.checked },
                      })
                    }
                  />
                  Ativo
                </label>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemove(product.id, product.name)}
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && products?.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum produto cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
