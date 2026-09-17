'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/page-header';
import { OverviewTab } from '@/components/dashboard/overview-tab';
import { GoalsTab } from '@/components/dashboard/goals-tab';
import { RepsTab } from '@/components/dashboard/reps-tab';
import { ProspectingTab } from '@/components/dashboard/prospecting-tab';
import { useDashboard } from '@/hooks/useDashboard';
import { usePipelines } from '@/hooks/usePipelines';

export default function DashboardPage() {
  const { data: pipelines } = usePipelines();
  const [pipelineId, setPipelineId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!pipelineId && pipelines && pipelines.length > 0) {
      const preferred = pipelines.find((p) => p.isDefault) ?? pipelines[0];
      setPipelineId(preferred.id);
    }
  }, [pipelines, pipelineId]);

  const { data, isLoading } = useDashboard(pipelineId);
  const selectedPipeline = pipelines?.find((p) => p.id === (pipelineId ?? data?.pipeline.pipelineId));

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Carregando dashboard...</p>;
  }

  const stages = [...(selectedPipeline?.stages ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu pipeline e atividades recentes"
      />

      {pipelines && pipelines.length > 1 && (
        <Tabs value={pipelineId} onValueChange={setPipelineId} className="mb-4">
          <TabsList>
            {pipelines.map((p) => (
              <TabsTrigger key={p.id} value={p.id}>
                {p.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <Tabs defaultValue="overview">
        <TabsList variant="line" className="mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="reps">Vendedores</TabsTrigger>
          <TabsTrigger value="prospecting">Prospecção</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab data={data} stages={stages} />
        </TabsContent>
        <TabsContent value="goals">
          <GoalsTab pipelineId={pipelineId} />
        </TabsContent>
        <TabsContent value="reps">
          <RepsTab pipelineId={pipelineId} />
        </TabsContent>
        <TabsContent value="prospecting">
          <ProspectingTab pipelineId={pipelineId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
