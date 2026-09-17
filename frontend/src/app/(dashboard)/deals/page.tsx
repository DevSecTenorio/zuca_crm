'use client';

import { useEffect, useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DealFormDialog } from '@/components/deals/deal-form-dialog';
import { DealKanban } from '@/components/deals/deal-kanban';
import { useDeals } from '@/hooks/useDeals';
import { usePipelines } from '@/hooks/usePipelines';

export default function DealsPage() {
  const { data: pipelines, isLoading: isLoadingPipelines } = usePipelines();
  const [pipelineId, setPipelineId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!pipelineId && pipelines && pipelines.length > 0) {
      const preferred = pipelines.find((p) => p.isDefault) ?? pipelines[0];
      setPipelineId(preferred.id);
    }
  }, [pipelines, pipelineId]);

  const { data: deals, isLoading: isLoadingDeals } = useDeals(pipelineId);
  const selectedPipeline = pipelines?.find((p) => p.id === pipelineId);

  return (
    <div>
      <PageHeader
        title="Negociações"
        description="Arraste os cards entre as etapas para atualizar o funil"
        actions={
          selectedPipeline && (
            <DealFormDialog
              pipelineId={selectedPipeline.id}
              trigger={
                <Button>
                  <IconPlus size={16} className="mr-1.5" /> Nova Negociação
                </Button>
              }
            />
          )
        }
      />

      {isLoadingPipelines && <p className="text-sm text-muted-foreground">Carregando funis...</p>}

      {!isLoadingPipelines && pipelines && pipelines.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Você ainda não tem acesso a nenhum funil de vendas. Peça a um administrador para te
          adicionar a um funil.
        </p>
      )}

      {pipelines && pipelines.length > 0 && (
        <Tabs value={pipelineId} onValueChange={setPipelineId} className="mb-4">
          <TabsList>
            {pipelines.map((pipeline) => (
              <TabsTrigger key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {isLoadingDeals && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {!isLoadingDeals && deals && selectedPipeline && (
        <DealKanban deals={deals} stages={selectedPipeline.stages} />
      )}
    </div>
  );
}
