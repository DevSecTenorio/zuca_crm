'use client';

import Image from 'next/image';
import { IconMenu2 } from '@tabler/icons-react';
import { useUiStore } from '@/store/ui-store';

export function MobileTopBar() {
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  return (
    <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3 lg:hidden">
      <button
        onClick={() => setMobileNavOpen(true)}
        title="Abrir menu"
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <IconMenu2 size={20} />
      </button>
      <Image src="/brand/logo-full.png" alt="Zuca CRM" width={1682} height={626} className="h-6 w-auto" />
    </div>
  );
}
