'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconArrowLeft,
  IconBuilding,
  IconCalendar,
  IconMail,
  IconPencil,
  IconPhone,
  IconTrash,
  IconUser,
  IconWorld,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDeal, useChangeDealStage, useDeleteDeal } from '@/hooks/useDeals';
import { useDealActivities } from '@/hooks/useActivities';
import { LogActivityForm } from '@/components/activities/log-activity-form';
import { DealEditDialog } from '@/components/deals/deal-edit-dialog';
import { LossReasonDialog } from '@/components/deals/loss-reason-dialog';
import { formatCurrencyBRL, formatDate, formatDateTime, getInitials } from '@/lib/format';
import { ACTIVITY_TYPE_LABELS } from '@/lib/deal-stages';

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: deal, isLoading } = useDeal(id);
  const { data: activities } = useDealActivities(id);
  const changeStage = useChangeDealStage();
  const deleteDeal = useDeleteDeal();
  const [pendingLostStageId, setPendingLostStageId] = useState<string | null>(null);

  if (isLoading || !deal) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  const stages = [...(deal.pipeline?.stages ?? [])].sort((a, b) => a.order - b.order);

  const handleStageChange = (stageId: string) => {
    const stage = stages.find((s) => s.id === stageId);
    if (stage?.isLost) {
      setPendingLostStageId(stageId);
      return;
    }
    changeStage.mutate({ id: deal.id, stageId });
  };

  const handleDelete = () => {
    if (!window.confirm(`Excluir a negociação "${deal.title}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    deleteDeal.mutate(deal.id, { onSuccess: () => router.push('/deals') });
  };

  return (
    <div>
      <Link
        href="/deals"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft size={16} /> Voltar para Negociações
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight">{deal.title}</h1>
            <Badge variant={deal.status === 'archived' ? 'secondary' : 'outline'}>
              {deal.status === 'archived' ? 'Arquivado' : 'Ativo'}
            </Badge>
          </div>
          <p className="mt-1 text-lg font-semibold text-primary">
            {formatCurrencyBRL(deal.value)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DealEditDialog
            deal={deal}
            trigger={
              <Button variant="outline">
                <IconPencil size={16} className="mr-1.5" /> Editar
              </Button>
            }
          />
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteDeal.isPending}
          >
            <IconTrash size={16} className="mr-1.5" /> Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhes da Negociação</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Funil</span>
                <span>{deal.pipeline?.name ?? '-'}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Etapa</span>
                <Select value={deal.stageId} onValueChange={handleStageChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Probabilidade</span>
                <span>{deal.probability}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Responsável</span>
                <span>{deal.owner?.name ?? '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconCalendar size={14} />
                <span className="text-xs">
                  Previsão de fechamento: {formatDate(deal.expectedCloseDate)}
                </span>
              </div>
              {deal.closedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconCalendar size={14} />
                  <span className="text-xs">Fechado em: {formatDateTime(deal.closedAt)}</span>
                </div>
              )}
              {deal.lossReason && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Motivo da perda
                  </span>
                  <Badge variant="destructive">{deal.lossReason.name}</Badge>
                </div>
              )}
              {deal.products && deal.products.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Produtos e Serviços
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {deal.products.map((product) => (
                      <Badge key={product.id} variant="outline">
                        {product.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t pt-2 text-xs text-muted-foreground">
                Criado em {formatDateTime(deal.createdAt)}
                <br />
                Atualizado em {formatDateTime(deal.updatedAt)}
              </div>
            </CardContent>
          </Card>

          {deal.company && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconBuilding size={16} /> Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <Link
                  href={`/companies/${deal.company.id}`}
                  className="font-medium hover:underline"
                >
                  {deal.company.razaoSocial}
                </Link>
                {deal.company.nomeFantasia && (
                  <p className="text-muted-foreground">{deal.company.nomeFantasia}</p>
                )}
                {deal.company.cnpj && (
                  <p className="text-muted-foreground">CNPJ: {deal.company.cnpj}</p>
                )}
                {deal.company.segment && (
                  <p className="text-muted-foreground">Segmento: {deal.company.segment.name}</p>
                )}
                {deal.company.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconMail size={14} /> {deal.company.email}
                  </div>
                )}
                {deal.company.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconPhone size={14} /> {deal.company.phone}
                  </div>
                )}
                {deal.company.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconWorld size={14} /> {deal.company.website}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {deal.contact && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconUser size={16} /> Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {getInitials(deal.contact.name)}
                  </div>
                  <Link href={`/contacts/${deal.contact.id}`} className="font-medium hover:underline">
                    {deal.contact.name}
                  </Link>
                </div>
                {deal.contact.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconMail size={14} /> {deal.contact.email}
                  </div>
                )}
                {deal.contact.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconPhone size={14} /> {deal.contact.phone}
                  </div>
                )}
                {deal.contact.tags && deal.contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {deal.contact.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              {deal.description ? (
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {deal.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma observação ainda. Clique em &quot;Editar&quot; para adicionar.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <LogActivityForm dealId={id} contactId={deal.contactId ?? undefined} companyId={deal.companyId ?? undefined} />

              <div className="flex flex-col gap-3">
                {activities?.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
                )}
                {activities?.map((activity) => (
                  <div key={activity.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{ACTIVITY_TYPE_LABELS[activity.type]}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(activity.createdAt)}
                      </span>
                    </div>
                    {activity.title && (
                      <p className="mt-1 text-sm font-medium">{activity.title}</p>
                    )}
                    {activity.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <LossReasonDialog
        open={!!pendingLostStageId}
        onOpenChange={(open) => !open && setPendingLostStageId(null)}
        onConfirm={(lossReasonId) => {
          if (pendingLostStageId) {
            changeStage.mutate({ id: deal.id, stageId: pendingLostStageId, lossReasonId });
          }
        }}
      />
    </div>
  );
}
