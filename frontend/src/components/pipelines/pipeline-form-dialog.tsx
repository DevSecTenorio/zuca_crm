'use client';

import { useState } from 'react';
import { IconGripVertical, IconPlus, IconTrash } from '@tabler/icons-react';
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
import { useCreatePipeline } from '@/hooks/usePipelines';
import type { PipelineStageInput } from '@/api/pipelines';

const DEFAULT_STAGES: PipelineStageInput[] = [
  { name: 'Lead', probability: 20 },
  { name: 'Proposta', probability: 50 },
  { name: 'Negociação', probability: 75 },
  { name: 'Ganho', probability: 100, isWon: true },
  { name: 'Perdido', probability: 0, isLost: true },
];

export function PipelineFormDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [stages, setStages] = useState<PipelineStageInput[]>(DEFAULT_STAGES);
  const createPipeline = useCreatePipeline();

  const resetForm = () => {
    setName('');
    setStages(DEFAULT_STAGES);
  };

  const updateStage = (index: number, patch: Partial<PipelineStageInput>) => {
    setStages((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const removeStage = (index: number) => {
    setStages((prev) => prev.filter((_, i) => i !== index));
  };

  const addStage = () => {
    setStages((prev) => [...prev, { name: '', probability: 50 }]);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || stages.length === 0 || stages.some((s) => !s.name.trim())) {
      return;
    }
    createPipeline.mutate(
      { name: name.trim(), stages },
      {
        onSuccess: () => {
          setOpen(false);
          resetForm();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Funil de Vendas</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pipeline-name">Nome do funil</Label>
            <Input
              id="pipeline-name"
              placeholder="Ex: Fornecedores"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Etapas</Label>
            {stages.map((stage, index) => (
              <div key={index} className="flex items-center gap-2">
                <IconGripVertical size={16} className="shrink-0 text-muted-foreground" />
                <Input
                  placeholder="Nome da etapa"
                  value={stage.name}
                  onChange={(e) => updateStage(index, { name: e.target.value })}
                  className="flex-1"
                />
                <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={!!stage.isWon}
                    onChange={(e) =>
                      updateStage(index, {
                        isWon: e.target.checked,
                        isLost: e.target.checked ? false : stage.isLost,
                      })
                    }
                  />
                  Ganho
                </label>
                <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={!!stage.isLost}
                    onChange={(e) =>
                      updateStage(index, {
                        isLost: e.target.checked,
                        isWon: e.target.checked ? false : stage.isWon,
                      })
                    }
                  />
                  Perdido
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeStage(index)}
                  disabled={stages.length <= 1}
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addStage} className="self-start">
              <IconPlus size={14} className="mr-1" /> Adicionar etapa
            </Button>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createPipeline.isPending}>
              {createPipeline.isPending ? 'Criando...' : 'Criar Funil'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
