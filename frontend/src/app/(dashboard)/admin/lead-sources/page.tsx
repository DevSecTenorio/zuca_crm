'use client';

import { CatalogManager } from '@/components/admin/catalog-manager';
import { useAuthStore } from '@/store/auth-store';

export default function LeadSourcesAdminPage() {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <p className="text-sm text-muted-foreground">Acesso restrito.</p>;
  }
  return (
    <CatalogManager
      resource="lead-sources"
      title="Fontes"
      description="De onde vêm seus contatos e leads"
      itemLabel="Fonte"
    />
  );
}
