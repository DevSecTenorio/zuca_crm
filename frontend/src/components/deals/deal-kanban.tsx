'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Deal, PipelineStage } from '@/types/api';
import { DealCard } from './deal-card';
import { LossReasonDialog } from './loss-reason-dialog';
import { useChangeDealStage } from '@/hooks/useDeals';
import { formatCurrencyBRL } from '@/lib/format';

export function DealKanban({ deals, stages }: { deals: Deal[]; stages: PipelineStage[] }) {
  const changeStage = useChangeDealStage();
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [pendingLoss, setPendingLoss] = useState<{ dealId: string; stageId: string } | null>(null);
  const orderedStages = [...stages].sort((a, b) => a.order - b.order);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const dealId = e.dataTransfer.getData('text/plain');
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stageId === stage.id) return;

    if (stage.isLost) {
      setPendingLoss({ dealId, stageId: stage.id });
      return;
    }
    changeStage.mutate({ id: dealId, stageId: stage.id });
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {orderedStages.map((stage) => {
        const stageDeals = deals.filter((d) => d.stageId === stage.id);
        const totalValue = stageDeals.reduce((sum, d) => sum + Number(d.value ?? 0), 0);

        return (
          <div
            key={stage.id}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStage(stage.id);
            }}
            onDragLeave={() => setDragOverStage((s) => (s === stage.id ? null : s))}
            onDrop={(e) => handleDrop(e, stage)}
            className={cn(
              'flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30 transition-colors',
              dragOverStage === stage.id && 'border-primary bg-primary/5',
            )}
          >
            <div className="flex items-center justify-between border-b px-3 py-2.5">
              <div>
                <p className="text-sm font-semibold">{stage.name}</p>
                <p className="text-xs text-muted-foreground">
                  {stageDeals.length} · {formatCurrencyBRL(totalValue)}
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-2.5">
              {stageDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} onDragStart={handleDragStart} />
              ))}
              {stageDeals.length === 0 && (
                <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                  Arraste uma negociação aqui
                </div>
              )}
            </div>
          </div>
        );
      })}

      <LossReasonDialog
        open={!!pendingLoss}
        onOpenChange={(open) => !open && setPendingLoss(null)}
        onConfirm={(lossReasonId) => {
          if (pendingLoss) {
            changeStage.mutate({ id: pendingLoss.dealId, stageId: pendingLoss.stageId, lossReasonId });
          }
        }}
      />
    </div>
  );
}
