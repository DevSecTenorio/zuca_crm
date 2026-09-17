'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useRepsKpis } from '@/hooks/useInsights';
import { formatCurrencyBRL } from '@/lib/format';

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function defaultTo() {
  return new Date().toISOString().slice(0, 10);
}

export function RepsTab({ pipelineId }: { pipelineId?: string }) {
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(defaultTo());

  const filters = useMemo(
    () => ({
      from: new Date(`${from}T00:00:00`).toISOString(),
      to: new Date(`${to}T23:59:59`).toISOString(),
    }),
    [from, to],
  );

  const { data, isLoading } = useRepsKpis(filters.from, filters.to, pipelineId);

  const chartData = (data?.reps ?? [])
    .filter((r) => r.wonValue > 0 || r.openValue > 0)
    .map((r) => ({ name: r.userName.split(' ')[0], Ganho: r.wonValue, Aberto: r.openValue }));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reps-from">De</Label>
          <Input id="reps-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reps-to">Até</Label>
          <Input id="reps-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      {chartData.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-4">
            <p className="mb-3 text-sm font-medium">Valor ganho vs. em aberto por vendedor</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={40} />
                <Tooltip formatter={(v) => formatCurrencyBRL(Number(v))} />
                <Bar dataKey="Ganho" fill="var(--accent-green)" radius={4} />
                <Bar dataKey="Aberto" fill="var(--accent-blue)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {data?.reps.map((rep) => (
          <Card key={rep.userId}>
            <CardContent className="flex flex-col gap-3 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{rep.userName}</span>
                <span className="text-lg font-semibold text-accent-green">
                  {formatCurrencyBRL(rep.wonValue)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Criadas</p>
                  <p className="font-medium">{rep.dealsCreated}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ganhas / Perdidas</p>
                  <p className="font-medium">
                    {rep.dealsWon} / {rep.dealsLost}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Taxa de conversão</p>
                  <p className="font-medium">{rep.winRate !== null ? `${rep.winRate}%` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ciclo médio</p>
                  <p className="font-medium">
                    {rep.avgCycleDays !== null ? `${rep.avgCycleDays} dias` : '—'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>Ticket médio: {formatCurrencyBRL(rep.avgDealValue ?? 0)}</span>
                <span>
                  Em aberto: {rep.openDeals} · {formatCurrencyBRL(rep.openValue)}
                </span>
                <Badge variant="outline">{rep.activitiesLogged} atividades registradas</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {data && data.reps.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum vendedor encontrado.</p>
        )}
      </div>
    </div>
  );
}
