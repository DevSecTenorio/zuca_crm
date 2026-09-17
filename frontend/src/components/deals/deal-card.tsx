'use client';

import { useRouter } from 'next/navigation';
import { IconBuilding, IconUser } from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Deal } from '@/types/api';
import { formatCurrencyBRL } from '@/lib/format';

export function DealCard({
  deal,
  onDragStart,
}: {
  deal: Deal;
  onDragStart: (e: React.DragEvent, dealId: string) => void;
}) {
  const router = useRouter();

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      onClick={() => router.push(`/deals/${deal.id}`)}
      className="cursor-grab select-none py-3 active:cursor-grabbing"
    >
      <CardContent className="flex flex-col gap-1.5 px-3">
        <p className="text-sm font-medium leading-snug">{deal.title}</p>
        <p className="text-sm font-semibold text-primary">{formatCurrencyBRL(deal.value)}</p>
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          {deal.contact && (
            <span className="flex items-center gap-1">
              <IconUser size={13} /> {deal.contact.name}
            </span>
          )}
          {deal.company && (
            <span className="flex items-center gap-1">
              <IconBuilding size={13} /> {deal.company.razaoSocial}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
