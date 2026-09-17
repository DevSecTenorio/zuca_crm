'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useAuthStore } from '@/store/auth-store';
import { formatDateTime } from '@/lib/format';

const ACTION_LABELS: Record<string, string> = {
  'auth.login': 'Login',
  'auth.register': 'Organização criada',
  'user.created': 'Usuário criado',
  'user.updated': 'Usuário atualizado',
  'user.password_changed': 'Senha alterada',
  'deal.created': 'Negociação criada',
  'deal.stage_changed': 'Etapa alterada',
  'deal.deleted': 'Negociação excluída',
  'pipeline.created': 'Funil criado',
  'pipeline.deleted': 'Funil excluído',
};

export default function AuditLogsPage() {
  const user = useAuthStore((s) => s.user);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { data: logs, isLoading } = useAuditLogs({
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
  });

  if (user?.role !== 'admin') {
    return <p className="text-sm text-muted-foreground">Acesso restrito a administradores.</p>;
  }

  return (
    <div>
      <PageHeader
        title="Log de Auditoria"
        description="Histórico de ações realizadas na organização"
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="log-from">De</Label>
          <Input id="log-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="log-to">Até</Label>
          <Input id="log-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      <Card>
        <CardContent className="flex flex-col gap-1 pt-4">
          {logs?.map((log) => (
            <div
              key={log.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b py-2.5 text-sm last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <Badge variant="outline">{ACTION_LABELS[log.action] ?? log.action}</Badge>
                <span className="text-muted-foreground">{log.user?.name ?? 'Sistema'}</span>
              </div>
              <span className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</span>
            </div>
          ))}
          {!isLoading && logs?.length === 0 && (
            <p className="p-2 text-sm text-muted-foreground">Nenhum registro encontrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
