'use client';

import { CatalogManager } from '@/components/admin/catalog-manager';
import { useAuthStore } from '@/store/auth-store';

export default function CampaignsAdminPage() {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <p className="text-sm text-muted-foreground">Acesso restrito.</p>;
  }
  return (
    <CatalogManager
      resource="campaigns"
      title="Campanhas"
      description="Campanhas de marketing usadas para atribuir contatos e leads"
      itemLabel="Campanha"
    />
  );
}
