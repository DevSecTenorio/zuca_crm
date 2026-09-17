'use client';

import Link from 'next/link';
import {
  IconBriefcase,
  IconChartFunnel,
  IconHistory,
  IconSpeakerphone,
  IconTags,
  IconTarget,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';

const SECTIONS = [
  {
    href: '/admin/users',
    label: 'Usuários',
    description: 'Criar usuários, alterar tipo e senha',
    icon: IconUsers,
    adminOnly: true,
  },
  {
    href: '/admin/goals',
    label: 'Metas',
    description: 'Meta mensal de valor e negociações por vendedor',
    icon: IconTarget,
    adminOnly: false,
  },
  {
    href: '/admin/lead-sources',
    label: 'Fontes',
    description: 'De onde vêm seus leads',
    icon: IconTags,
    adminOnly: false,
  },
  {
    href: '/admin/campaigns',
    label: 'Campanhas',
    description: 'Campanhas de marketing',
    icon: IconSpeakerphone,
    adminOnly: false,
  },
  {
    href: '/admin/loss-reasons',
    label: 'Motivos de Perda',
    description: 'Por que uma negociação foi perdida',
    icon: IconX,
    adminOnly: false,
  },
  {
    href: '/admin/segments',
    label: 'Segmentos',
    description: 'Segmentos de mercado das empresas',
    icon: IconChartFunnel,
    adminOnly: false,
  },
  {
    href: '/admin/products',
    label: 'Produtos e Serviços',
    description: 'Catálogo do que é vendido nas negociações',
    icon: IconBriefcase,
    adminOnly: false,
  },
  {
    href: '/admin/logs',
    label: 'Log de Auditoria',
    description: 'Histórico de ações realizadas na organização',
    icon: IconHistory,
    adminOnly: true,
  },
] as const;

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const sections = SECTIONS.filter((s) => !s.adminOnly || user?.role === 'admin');

  return (
    <div>
      <PageHeader title="Administração" description="Configurações da organização" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-start gap-3 pt-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon size={18} stroke={1.75} />
                  </div>
                  <div>
                    <p className="font-medium">{section.label}</p>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
