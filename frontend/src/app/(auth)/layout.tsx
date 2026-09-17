import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-muted/40 px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative flex w-full max-w-sm flex-col items-center gap-6">
        <Image
          src="/brand/logo-full.png"
          alt="Zuca CRM"
          width={1682}
          height={626}
          priority
          className="h-24 w-auto"
        />
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
