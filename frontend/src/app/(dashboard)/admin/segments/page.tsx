'use client';

import { CatalogManager } from '@/components/admin/catalog-manager';
import { useAuthStore } from '@/store/auth-store';

export default function SegmentsAdminPage() {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <p className="text-sm text-muted-foreground">Acesso restrito.</p>;
  }
  return (
    <CatalogManager
      resource="segments"
      title="Segmentos"
      description="Segmentos de mercado usados para classificar empresas"
      itemLabel="Segmento"
    />
  );
}
