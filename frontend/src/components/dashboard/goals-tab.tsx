'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGoalsProgress } from '@/hooks/useInsights';
import { formatCurrencyBRL } from '@/lib/format';

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function defaultTo() {
  return new Date().toISOString().slice(0, 10);
}

function ProgressBar({ pct }: { pct: number | null }) {
  const value = pct === null ? 0 : Math.min(pct, 100);
  const over = pct !== null && pct >= 100;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full ${over ? 'bg-accent-green' : 'bg-primary'}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function GoalsTab({ pipelineId }: { pipelineId?: string }) {
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(defaultTo());

  const filters = useMemo(
    () => ({
      from: new Date(`${from}T00:00:00`).toISOString(),
      to: new Date(`${to}T23:59:59`).toISOString(),
    }),
    [from, to],
  );

  const { data, isLoading } = useGoalsProgress(filters.from, filters.to, pipelineId);

  const chartData = (data?.reps ?? []).map((r) => ({
    name: r.userName.split(' ')[0],
    Meta: r.targetValue,
    Realizado: r.wonValue,
  }));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="goals-from">De</Label>
          <Input id="goals-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="goals-to">Até</Label>
          <Input id="goals-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      {data && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground">Meta de valor (org.)</p>
                <p className="text-2xl font-semibold">
                  {formatCurrencyBRL(data.orgTotals.targetValue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground">Realizado</p>
                <p className="text-2xl font-semibold text-accent-green">
                  {formatCurrencyBRL(data.orgTotals.wonValue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground">% da meta (valor)</p>
                <p className="text-2xl font-semibold">
                  {data.orgTotals.progressValuePct ?? '—'}
                  {data.orgTotals.progressValuePct !== null && '%'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Negociações ({data.orgTotals.wonCount}/{data.orgTotals.targetCount})
                </p>
                <p className="text-2xl font-semibold">
                  {data.orgTotals.progressCountPct ?? '—'}
                  {data.orgTotals.progressCountPct !== null && '%'}
                </p>
              </CardContent>
            </Card>
          </div>

          {chartData.length > 0 && (
            <Card className="mb-6">
              <CardContent className="pt-4">
                <p className="mb-3 text-sm font-medium">Meta vs. realizado por vendedor</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis
                      fontSize={12}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                      width={40}
                    />
                    <Tooltip formatter={(v) => formatCurrencyBRL(Number(v))} />
                    <Legend />
                    <Bar dataKey="Meta" fill="var(--muted-foreground)" radius={4} />
                    <Bar dataKey="Realizado" fill="var(--primary)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-3">
            {data.reps.map((rep) => (
              <Card key={rep.userId}>
                <CardContent className="flex flex-col gap-3 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{rep.userName}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrencyBRL(rep.wonValue)} / {formatCurrencyBRL(rep.targetValue)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <ProgressBar pct={rep.progressValuePct} />
                    <span className="text-xs text-muted-foreground">
                      {rep.progressValuePct ?? 0}% da meta de valor
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <ProgressBar pct={rep.progressCountPct} />
                    <span className="text-xs text-muted-foreground">
                      {rep.wonCount}/{rep.targetCount} negociações ({rep.progressCountPct ?? 0}%)
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {data.reps.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma meta cadastrada para este período. Configure em Configurações → Metas.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
