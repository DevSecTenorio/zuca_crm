import { AuthGuard } from '@/components/providers/auth-guard';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileTopBar } from '@/components/layout/mobile-top-bar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar />
          <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
