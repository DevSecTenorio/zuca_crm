'use client';

import Link from 'next/link';
import {
  IconAlertTriangle,
  IconClockHour4,
  IconCoin,
  IconLayoutKanban,
  IconPlugConnected,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyBRL, formatDateTime } from '@/lib/format';
import { ACTIVITY_TYPE_LABELS } from '@/lib/deal-stages';
import type { DashboardData, PipelineStage } from '@/types/api';

function StatIcon({
  icon: Icon,
  color,
}: {
  icon: React.ComponentType<{ size?: number; stroke?: number; className?: string }>;
  color: 'green' | 'blue' | 'yellow' | 'pink';
}) {
  const colorClasses: Record<typeof color, string> = {
    green: 'bg-accent-green/10 text-accent-green',
    blue: 'bg-accent-blue/10 text-accent-blue',
    yellow: 'bg-accent-yellow/10 text-accent-yellow',
    pink: 'bg-accent-pink/10 text-accent-pink',
  };
  return (
    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorClasses[color]}`}>
      <Icon size={18} stroke={1.75} />
    </div>
  );
}

export function OverviewTab({
  data,
  stages,
}: {
  data: DashboardData;
  stages: PipelineStage[];
}) {
  const { pipeline, recentActivities, seuZucaSyncStatus } = data;

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor total em aberto
            </CardTitle>
            <StatIcon icon={IconCoin} color="green" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrencyBRL(pipeline.totalOpenValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Negociações ativas
            </CardTitle>
            <StatIcon icon={IconLayoutKanban} color="blue" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{pipeline.totalDeals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Follow-ups pendentes
            </CardTitle>
            <StatIcon icon={IconClockHour4} color="yellow" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{pipeline.stalledDeals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sync Seu Zuca
            </CardTitle>
            <StatIcon icon={IconPlugConnected} color="pink" />
          </CardHeader>
          <CardContent>
            <Badge variant={seuZucaSyncStatus === 'connected' ? 'default' : 'secondary'}>
              {seuZucaSyncStatus === 'connected' ? 'Conectado' : 'Não conectado'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stages.map((stage) => (
          <Card key={stage.id} size="sm">
            <CardContent className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">{stage.name}</span>
              <span className="text-lg font-semibold">
                {pipeline.byStage[stage.id]?.count ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatCurrencyBRL(pipeline.byStage[stage.id]?.totalValue ?? 0)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconClockHour4 size={18} /> Follow-ups (7+ dias parados)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {pipeline.stalledDeals.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma negociação travada. 🎉</p>
            )}
            {pipeline.stalledDeals.map((deal) => (
              <Link
                key={deal.id}
                href="/deals"
                className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted"
              >
                <div className="flex items-center gap-2">
                  <IconAlertTriangle size={16} className="text-amber-500" />
                  <span className="font-medium">{deal.title}</span>
                </div>
                {deal.stage && <Badge variant="outline">{deal.stage.name}</Badge>}
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividades recentes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentActivities.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma atividade ainda.</p>
            )}
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex flex-col gap-0.5 border-b pb-2 last:border-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{ACTIVITY_TYPE_LABELS[activity.type]}</Badge>
                  <span className="text-sm font-medium">{activity.title}</span>
                </div>
                {activity.description && (
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(activity.createdAt)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
