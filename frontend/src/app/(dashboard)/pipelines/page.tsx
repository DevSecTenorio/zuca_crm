'use client';

import { useState } from 'react';
import {
  IconCheck,
  IconPencil,
  IconPlus,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PipelineFormDialog } from '@/components/pipelines/pipeline-form-dialog';
import { PipelineStagesDialog } from '@/components/pipelines/pipeline-stages-dialog';
import { PipelineMembersDialog } from '@/components/pipelines/pipeline-members-dialog';
import { useAuthStore } from '@/store/auth-store';
import { useDeletePipeline, usePipelines, useUpdatePipeline } from '@/hooks/usePipelines';
import type { Pipeline } from '@/types/api';

export default function PipelinesPage() {
  const user = useAuthStore((s) => s.user);
  const { data: pipelines, isLoading } = usePipelines();
  const updatePipeline = useUpdatePipeline();
  const deletePipeline = useDeletePipeline();
  const [stagesPipelineId, setStagesPipelineId] = useState<string | null>(null);
  const [membersPipelineId, setMembersPipelineId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const stagesPipeline = pipelines?.find((p) => p.id === stagesPipelineId) ?? null;
  const membersPipeline = pipelines?.find((p) => p.id === membersPipelineId) ?? null;

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  if (!canManage) {
    return (
      <div>
        <PageHeader title="Funis de Vendas" />
        <p className="text-sm text-muted-foreground">
          Apenas administradores e managers podem gerenciar funis de vendas.
        </p>
      </div>
    );
  }

  const handleDelete = (pipeline: Pipeline) => {
    if (!window.confirm(`Remover o funil "${pipeline.name}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    deletePipeline.mutate(pipeline.id);
  };

  const handleSetDefault = (pipeline: Pipeline) => {
    updatePipeline.mutate({ id: pipeline.id, payload: { isDefault: true } });
  };

  const startRenaming = (pipeline: Pipeline) => {
    setRenamingId(pipeline.id);
    setRenameValue(pipeline.name);
  };

  const cancelRenaming = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const saveRenaming = (pipeline: Pipeline) => {
    const name = renameValue.trim();
    if (!name || name === pipeline.name) {
      cancelRenaming();
      return;
    }
    updatePipeline.mutate(
      { id: pipeline.id, payload: { name } },
      { onSuccess: cancelRenaming },
    );
  };

  return (
    <div>
      <PageHeader
        title="Funis de Vendas"
        description="Crie funis separados para diferentes fluxos de venda (ex: fornecedores, compradores)"
        actions={
          <PipelineFormDialog
            trigger={
              <Button>
                <IconPlus size={16} className="mr-1.5" /> Novo Funil
              </Button>
            }
          />
        }
      />

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pipelines?.map((pipeline) => {
          const stages = [...pipeline.stages].sort((a, b) => a.order - b.order);
          return (
            <Card key={pipeline.id}>
              <CardHeader className="flex-row items-center justify-between">
                {renamingId === pipeline.id ? (
                  <div className="flex flex-1 items-center gap-1.5">
                    <Input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveRenaming(pipeline);
                        }
                        if (e.key === 'Escape') cancelRenaming();
                      }}
                      className="h-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => saveRenaming(pipeline)}
                      disabled={updatePipeline.isPending}
                    >
                      <IconCheck size={14} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={cancelRenaming}>
                      <IconX size={14} />
                    </Button>
                  </div>
                ) : (
                  <CardTitle className="flex items-center gap-2 text-base">
                    {pipeline.name}
                    {pipeline.isDefault && <Badge variant="secondary">Padrão</Badge>}
                    <button
                      type="button"
                      title="Renomear funil"
                      onClick={() => startRenaming(pipeline)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <IconPencil size={14} />
                    </button>
                  </CardTitle>
                )}
                <button
                  type="button"
                  title={pipeline.isDefault ? 'Funil padrão' : 'Tornar padrão'}
                  onClick={() => !pipeline.isDefault && handleSetDefault(pipeline)}
                  className="shrink-0 text-muted-foreground hover:text-accent-yellow disabled:cursor-default"
                  disabled={pipeline.isDefault}
                >
                  {pipeline.isDefault ? (
                    <IconStarFilled size={16} className="text-accent-yellow" />
                  ) : (
                    <IconStar size={16} />
                  )}
                </button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {stages.map((stage) => (
                    <Badge key={stage.id} variant="outline">
                      {stage.name}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStagesPipelineId(pipeline.id)}>
                    Etapas
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setMembersPipelineId(pipeline.id)}>
                    <IconUsers size={14} className="mr-1" /> Membros
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="ml-auto text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(pipeline)}
                  >
                    <IconTrash size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <PipelineStagesDialog
        pipeline={stagesPipeline}
        open={!!stagesPipeline}
        onOpenChange={(open) => !open && setStagesPipelineId(null)}
      />
      <PipelineMembersDialog
        pipeline={membersPipeline}
        open={!!membersPipeline}
        onOpenChange={(open) => !open && setMembersPipelineId(null)}
      />
    </div>
  );
}
