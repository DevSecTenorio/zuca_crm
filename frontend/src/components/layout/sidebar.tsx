'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  IconLayoutDashboard,
  IconUsers,
  IconBuilding,
  IconLayoutKanban,
  IconLogout,
  IconChartFunnel,
  IconSettings,
  IconCalendarEvent,
  IconReportAnalytics,
  IconChevronsLeft,
  IconChevronsRight,
  IconX,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useUiStore } from '@/store/ui-store';
import { useLogout } from '@/hooks/useAuth';
import { getInitials } from '@/lib/format';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
  { href: '/deals', label: 'Negociações', icon: IconLayoutKanban },
  { href: '/agenda', label: 'Agenda', icon: IconCalendarEvent },
  { href: '/contacts', label: 'Contatos', icon: IconUsers },
  { href: '/companies', label: 'Empresas', icon: IconBuilding },
  { href: '/reports', label: 'Relatórios', icon: IconReportAnalytics },
] as const;

const MANAGE_NAV_ITEMS = [
  { href: '/pipelines', label: 'Funis', icon: IconChartFunnel },
  { href: '/admin', label: 'Configurações', icon: IconSettings },
] as const;

function useIsLgUp() {
  const [isLgUp, setIsLgUp] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    setIsLgUp(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsLgUp(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isLgUp;
}

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const isLgUp = useIsLgUp();
  const isCollapsed = collapsed && isLgUp;

  const canManagePipelines = user?.role === 'admin' || user?.role === 'manager';
  const navItems = canManagePipelines ? [...NAV_ITEMS, ...MANAGE_NAV_ITEMS] : NAV_ITEMS;

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  return (
    <>
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:transition-[width] lg:duration-200',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-64',
        )}
      >
        <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
          {isCollapsed ? (
            <Image src="/brand/logo-icon.png" alt="Zuca CRM" width={32} height={32} priority className="h-7 w-7" />
          ) : (
            <Image
              src="/brand/logo-full.png"
              alt="Zuca CRM"
              width={1682}
              height={626}
              priority
              className="h-7 w-auto"
            />
          )}
          <button
            onClick={() => setMobileNavOpen(false)}
            title="Fechar menu"
            className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
          >
            <IconX size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3 pt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  active && 'bg-sidebar-accent text-sidebar-accent-foreground',
                  isCollapsed && 'justify-center px-0',
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
                )}
                <Icon size={18} stroke={1.75} />
                {!isCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className={cn(
            'mx-3 mb-2 hidden items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:flex',
            isCollapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? <IconChevronsRight size={18} stroke={1.75} /> : <IconChevronsLeft size={18} stroke={1.75} />}
          {!isCollapsed && 'Recolher'}
        </button>

        <div className="border-t border-sidebar-border p-3">
          <div
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2 py-2',
              isCollapsed && 'flex-col gap-2 px-0',
            )}
          >
            <Link
              href="/profile"
              title="Meu perfil"
              className={cn(
                'flex min-w-0 flex-1 items-center gap-2.5 rounded-md hover:opacity-80',
                isCollapsed && 'flex-col gap-2',
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                {getInitials(user?.name)}
              </div>
              {!isCollapsed && (
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-sidebar-foreground">
                    {user?.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{user?.role}</span>
                </div>
              )}
            </Link>
            <button
              onClick={logout}
              title="Sair"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <IconLogout size={18} stroke={1.75} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
