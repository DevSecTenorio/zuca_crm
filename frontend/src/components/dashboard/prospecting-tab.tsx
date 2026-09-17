'use client';

import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProspecting } from '@/hooks/useInsights';
import { formatCurrencyBRL, formatDate } from '@/lib/format';

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function defaultTo() {
  return new Date().toISOString().slice(0, 10);
}

export function ProspectingTab({ pipelineId }: { pipelineId?: string }) {
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(defaultTo());

  const filters = useMemo(
    () => ({
      from: new Date(`${from}T00:00:00`).toISOString(),
      to: new Date(`${to}T23:59:59`).toISOString(),
    }),
    [from, to],
  );

  const { data, isLoading } = useProspecting(filters.from, filters.to, pipelineId);

  const timelineData = (data?.timeline ?? []).map((t) => ({
    date: formatDate(t.date),
    Contatos: t.contacts,
    Negociações: t.deals,
  }));

  const maxFunnelCount = Math.max(1, ...(data?.funnel ?? []).map((f) => f.count));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prosp-from">De</Label>
          <Input id="prosp-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prosp-to">Até</Label>
          <Input id="prosp-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      {data && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground">Novos contatos</p>
                <p className="text-2xl font-semibold">{data.newContacts}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground">Novas empresas</p>
                <p className="text-2xl font-semibold">{data.newCompanies}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Novas negociações
                </p>
                <p className="text-2xl font-semibold">{data.newDeals.count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground">Valor prospectado</p>
                <p className="text-2xl font-semibold">{formatCurrencyBRL(data.newDeals.value)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-4">
              <p className="mb-3 text-sm font-medium">Novos contatos e negociações no período</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" fontSize={11} minTickGap={20} />
                  <YAxis fontSize={12} width={30} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Contatos" stroke="var(--accent-blue)" strokeWidth={2} dot={false} />
                  <Line
                    type="monotone"
                    dataKey="Negociações"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="pt-4">
                <p className="mb-3 text-sm font-medium">Funil (negociações abertas por etapa)</p>
                <div className="flex flex-col gap-2.5">
                  {data.funnel.map((stage) => (
                    <div key={stage.stageId}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{stage.stageName}</span>
                        <span className="text-muted-foreground">
                          {stage.count} · {formatCurrencyBRL(stage.totalValue)}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(stage.count / maxFunnelCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {data.funnel.length === 0 && (
                    <p className="text-sm text-muted-foreground">Sem dados de funil.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <p className="mb-3 text-sm font-medium">Origem dos novos contatos</p>
                <div className="flex flex-col gap-2">
                  {data.bySource.map((source) => (
                    <div
                      key={source.sourceId ?? 'none'}
                      className="flex items-center justify-between rounded-md border p-2.5 text-sm"
                    >
                      <span>{source.sourceName}</span>
                      <span className="font-medium">{source.count}</span>
                    </div>
                  ))}
                  {data.bySource.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum contato no período.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
