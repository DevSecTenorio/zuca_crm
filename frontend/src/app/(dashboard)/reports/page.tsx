'use client';

import { useMemo, useState } from 'react';
import { IconDownload } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDealsReport } from '@/hooks/useReports';
import { usePipelines } from '@/hooks/usePipelines';
import { downloadCsv } from '@/lib/csv';
import { formatCurrencyBRL, formatDate, formatDateTime } from '@/lib/format';

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function defaultTo() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(defaultTo());
  const [pipelineId, setPipelineId] = useState<string | undefined>(undefined);
  const { data: pipelines } = usePipelines();

  const filters = useMemo(
    () => ({
      from: new Date(`${from}T00:00:00`).toISOString(),
      to: new Date(`${to}T23:59:59`).toISOString(),
      pipelineId,
    }),
    [from, to, pipelineId],
  );

  const { data: deals, isLoading } = useDealsReport(filters);

  const summary = useMemo(() => {
    const list = deals ?? [];
    const won = list.filter((d) => d.stage?.isWon);
    const lost = list.filter((d) => d.stage?.isLost);
    const totalValue = list.reduce((sum, d) => sum + Number(d.value ?? 0), 0);
    const wonValue = won.reduce((sum, d) => sum + Number(d.value ?? 0), 0);
    return {
      total: list.length,
      totalValue,
      wonCount: won.length,
      wonValue,
      lostCount: lost.length,
    };
  }, [deals]);

  const handleExport = () => {
    if (!deals || deals.length === 0) return;
    downloadCsv(
      `relatorio-negociacoes-${from}-a-${to}.csv`,
      [
        { key: 'title', label: 'Título' },
        { key: 'pipeline', label: 'Funil' },
        { key: 'stage', label: 'Etapa' },
        { key: 'status', label: 'Status' },
        { key: 'value', label: 'Valor' },
        { key: 'company', label: 'Empresa' },
        { key: 'contact', label: 'Contato' },
        { key: 'owner', label: 'Responsável' },
        { key: 'lossReason', label: 'Motivo da perda' },
        { key: 'createdAt', label: 'Criado em' },
        { key: 'closedAt', label: 'Fechado em' },
      ],
      deals.map((deal) => ({
        title: deal.title,
        pipeline: deal.pipeline?.name ?? '',
        stage: deal.stage?.name ?? '',
        status: deal.status === 'archived' ? 'Arquivado' : 'Ativo',
        value: deal.value ?? 0,
        company: deal.company?.razaoSocial ?? '',
        contact: deal.contact?.name ?? '',
        owner: deal.owner?.name ?? '',
        lossReason: deal.lossReason?.name ?? '',
        createdAt: formatDate(deal.createdAt),
        closedAt: deal.closedAt ? formatDate(deal.closedAt) : '',
      })),
    );
  };

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Escolha um período para analisar e exportar as negociações"
        actions={
          <Button onClick={handleExport} disabled={!deals || deals.length === 0}>
            <IconDownload size={16} className="mr-1.5" /> Exportar CSV
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="report-from">De</Label>
          <Input id="report-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="report-to">Até</Label>
          <Input id="report-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Funil</Label>
          <Select
            value={pipelineId ?? 'all'}
            onValueChange={(v) => setPipelineId(v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os funis</SelectItem>
              {pipelines?.map((pipeline) => (
                <SelectItem key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-muted-foreground">Negociações no período</p>
            <p className="text-2xl font-semibold">{summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-muted-foreground">Valor total</p>
            <p className="text-2xl font-semibold">{formatCurrencyBRL(summary.totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-muted-foreground">Ganhas</p>
            <p className="text-2xl font-semibold text-accent-green">
              {summary.wonCount} · {formatCurrencyBRL(summary.wonValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-muted-foreground">Perdidas</p>
            <p className="text-2xl font-semibold text-destructive">{summary.lostCount}</p>
          </CardContent>
        </Card>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      <Card>
        <CardContent className="flex flex-col gap-1 pt-4">
          {deals?.map((deal) => (
            <div
              key={deal.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b py-2.5 text-sm last:border-0"
            >
              <div className="min-w-0">
                <p className="font-medium">{deal.title}</p>
                <p className="text-xs text-muted-foreground">
                  {deal.pipeline?.name} · {deal.company?.razaoSocial ?? 'Sem empresa'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{deal.stage?.name}</Badge>
                <span className="font-medium">{formatCurrencyBRL(deal.value)}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {formatDateTime(deal.createdAt)}
                </span>
              </div>
            </div>
          ))}
          {!isLoading && deals?.length === 0 && (
            <p className="p-2 text-sm text-muted-foreground">
              Nenhuma negociação encontrada nesse período.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
