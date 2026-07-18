import type { ReactNode } from 'react';
import { Logo } from '@/components/Logo';

/** Moldura centrada e responsiva das telas de autenticação (login/registro). */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* Halo radial sutil atrás do cartão. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-foreground/[0.06] blur-3xl"
      />

      <div className="animate-in-up relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-5 text-center">
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 scale-150 rounded-full bg-foreground/10 blur-xl"
            />
            <Logo />
          </div>
          <div>
            <h1 className="text-gradient text-2xl font-bold tracking-tight">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-xl shadow-black/5 backdrop-blur-sm">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          DevFlow · seu ambiente de desenvolvimento
        </p>
      </div>
    </div>
  );
}
