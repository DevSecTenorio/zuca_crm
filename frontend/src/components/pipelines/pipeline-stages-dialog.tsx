'use client';

import { useEffect, useState } from 'react';
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Pipeline, PipelineStage } from '@/types/api';
import {
  useAddStage,
  useRemoveStage,
  useReorderStages,
  useUpdateStage,
} from '@/hooks/usePipelines';

export function PipelineStagesDialog({
  pipeline,
  open,
  onOpenChange,
}: {
  pipeline: Pipeline | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addStage = useAddStage();
  const updateStage = useUpdateStage();
  const removeStage = useRemoveStage();
  const reorderStages = useReorderStages();
  const [newStageName, setNewStageName] = useState('');

  const stages = [...(pipeline?.stages ?? [])].sort((a, b) => a.order - b.order);

  useEffect(() => {
    setNewStageName('');
  }, [pipeline?.id]);

  if (!pipeline) return null;

  const handleAdd = () => {
    if (!newStageName.trim()) return;
    addStage.mutate(
      { pipelineId: pipeline.id, payload: { name: newStageName.trim() } },
      { onSuccess: () => setNewStageName('') },
    );
  };

  const handleMove = (stage: PipelineStage, direction: -1 | 1) => {
    const index = stages.findIndex((s) => s.id === stage.id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= stages.length) return;
    const reordered = [...stages];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    reorderStages.mutate({ pipelineId: pipeline.id, stageIds: reordered.map((s) => s.id) });
  };

  const handleRemove = (stage: PipelineStage) => {
    if (!window.confirm(`Remover a etapa "${stage.name}"?`)) return;
    removeStage.mutate({ pipelineId: pipeline.id, stageId: stage.id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Etapas de &quot;{pipeline.name}&quot;</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-2 rounded-md border p-2">
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={index === 0}
                  onClick={() => handleMove(stage, -1)}
                >
                  <IconArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={index === stages.length - 1}
                  onClick={() => handleMove(stage, 1)}
                >
                  <IconArrowDown size={14} />
                </button>
              </div>
              <Input
                defaultValue={stage.name}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value && value !== stage.name) {
                    updateStage.mutate({
                      pipelineId: pipeline.id,
                      stageId: stage.id,
                      payload: { name: value },
                    });
                  }
                }}
                className="flex-1"
              />
              <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={stage.isWon}
                  onChange={(e) =>
                    updateStage.mutate({
                      pipelineId: pipeline.id,
                      stageId: stage.id,
                      payload: { isWon: e.target.checked, isLost: e.target.checked ? false : stage.isLost },
                    })
                  }
                />
                Ganho
              </label>
              <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={stage.isLost}
                  onChange={(e) =>
                    updateStage.mutate({
                      pipelineId: pipeline.id,
                      stageId: stage.id,
                      payload: { isLost: e.target.checked, isWon: e.target.checked ? false : stage.isWon },
                    })
                  }
                />
                Perdido
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemove(stage)}
                disabled={stages.length <= 1}
              >
                <IconTrash size={14} />
              </Button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2">
            <Input
              placeholder="Nova etapa"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleAdd} disabled={addStage.isPending}>
              <IconPlus size={14} className="mr-1" /> Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
