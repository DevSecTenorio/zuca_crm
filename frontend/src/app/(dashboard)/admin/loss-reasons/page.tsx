'use client';

import { CatalogManager } from '@/components/admin/catalog-manager';
import { useAuthStore } from '@/store/auth-store';

export default function LossReasonsAdminPage() {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <p className="text-sm text-muted-foreground">Acesso restrito.</p>;
  }
  return (
    <CatalogManager
      resource="loss-reasons"
      title="Motivos de Perda"
      description="Motivos usados ao marcar uma negociação como perdida"
      itemLabel="Motivo"
    />
  );
}
