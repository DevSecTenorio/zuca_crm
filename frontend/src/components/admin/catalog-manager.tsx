'use client';

import { useState } from 'react';
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { CatalogResource } from '@/api/catalogs';
import {
  useCatalogItems,
  useCreateCatalogItem,
  useRemoveCatalogItem,
  useReorderCatalogItems,
  useUpdateCatalogItem,
} from '@/hooks/useCatalog';
import type { CatalogItem } from '@/types/api';

export function CatalogManager({
  resource,
  title,
  description,
  itemLabel,
}: {
  resource: CatalogResource;
  title: string;
  description: string;
  itemLabel: string;
}) {
  const { data: items, isLoading } = useCatalogItems(resource);
  const createItem = useCreateCatalogItem(resource);
  const updateItem = useUpdateCatalogItem(resource);
  const removeItem = useRemoveCatalogItem(resource);
  const reorderItems = useReorderCatalogItems(resource);
  const [newName, setNewName] = useState('');

  const sorted = [...(items ?? [])].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    if (!newName.trim()) return;
    createItem.mutate({ name: newName.trim() }, { onSuccess: () => setNewName('') });
  };

  const handleMove = (item: CatalogItem, direction: -1 | 1) => {
    const index = sorted.findIndex((i) => i.id === item.id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    reorderItems.mutate(reordered.map((i) => i.id));
  };

  const handleRemove = (item: CatalogItem) => {
    if (!window.confirm(`Remover "${item.name}"?`)) return;
    removeItem.mutate(item.id);
  };

  return (
    <div>
      <PageHeader title={title} description={description} />

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      <div className="flex max-w-xl flex-col gap-2">
        {sorted.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2 rounded-md border p-2">
            <div className="flex shrink-0 flex-col">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                disabled={index === 0}
                onClick={() => handleMove(item, -1)}
              >
                <IconArrowUp size={14} />
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                disabled={index === sorted.length - 1}
                onClick={() => handleMove(item, 1)}
              >
                <IconArrowDown size={14} />
              </button>
            </div>
            <Input
              defaultValue={item.name}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value && value !== item.name) {
                  updateItem.mutate({ id: item.id, payload: { name: value } });
                }
              }}
              className="flex-1"
            />
            <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="accent-primary"
                checked={item.active}
                onChange={(e) =>
                  updateItem.mutate({ id: item.id, payload: { active: e.target.checked } })
                }
              />
              Ativo
            </label>
            {!item.active && <Badge variant="secondary">Inativo</Badge>}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleRemove(item)}
            >
              <IconTrash size={14} />
            </Button>
          </div>
        ))}

        {!isLoading && sorted.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum item cadastrado ainda.</p>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Input
            placeholder={`Novo(a) ${itemLabel.toLowerCase()}`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={handleAdd} disabled={createItem.isPending}>
            <IconPlus size={14} className="mr-1" /> Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}
