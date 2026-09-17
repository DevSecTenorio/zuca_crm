'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGoals, useUpsertGoal } from '@/hooks/useGoals';
import { MONTH_LABELS } from '@/lib/date';
import type { SalesGoalEntry } from '@/types/api';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - 5 + i);

function GoalRow({
  entry,
  year,
  month,
}: {
  entry: SalesGoalEntry;
  year: number;
  month: number;
}) {
  const [targetValue, setTargetValue] = useState(String(entry.targetValue));
  const [targetCount, setTargetCount] = useState(String(entry.targetCount));
  const upsertGoal = useUpsertGoal();

  useEffect(() => {
    setTargetValue(String(entry.targetValue));
    setTargetCount(String(entry.targetCount));
  }, [entry.targetValue, entry.targetCount]);

  const dirty =
    Number(targetValue || 0) !== entry.targetValue || Number(targetCount || 0) !== entry.targetCount;

  const handleSave = () => {
    upsertGoal.mutate({
      userId: entry.userId,
      year,
      month,
      targetValue: Number(targetValue || 0),
      targetCount: Number(targetCount || 0),
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-3 border-b py-3 last:border-0">
      <div className="min-w-[160px] flex-1">
        <p className="font-medium">{entry.userName}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Meta de valor (R$)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          className="w-40"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Meta de negociações</Label>
        <Input
          type="number"
          min="0"
          className="w-32"
          value={targetCount}
          onChange={(e) => setTargetCount(e.target.value)}
        />
      </div>
      <Button size="sm" disabled={!dirty || upsertGoal.isPending} onClick={handleSave}>
        {upsertGoal.isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </div>
  );
}

export default function AdminGoalsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: goals, isLoading } = useGoals(year, month);

  return (
    <div>
      <PageHeader
        title="Metas de vendas"
        description="Defina a meta mensal de valor e quantidade de negociações de cada vendedor"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTH_LABELS.map((label, index) => (
              <SelectItem key={label} value={String(index + 1)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      <Card>
        <CardContent className="flex flex-col pt-4">
          {goals?.map((entry) => (
            <GoalRow key={entry.userId} entry={entry} year={year} month={month} />
          ))}
          {goals?.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum usuário ativo encontrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
