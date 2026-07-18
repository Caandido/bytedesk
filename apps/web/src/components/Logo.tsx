import { cn } from '@/lib/utils';

/** Marca do DevFlow: um glifo de "fluxo" (nós conectados) monocromático. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn('size-8 text-foreground', className)}
      aria-hidden="true"
    >
      <rect
        x="1.25"
        y="1.25"
        width="29.5"
        height="29.5"
        rx="8.5"
        stroke="currentColor"
        strokeWidth="1.75"
        opacity="0.9"
      />
      <path
        d="M8.5 22.5 L14 13.5 L18.5 18 L23.5 9.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="logo-draw"
      />
      <circle cx="8.5" cy="22.5" r="2.1" fill="currentColor" className="logo-dot" />
      <circle cx="23.5" cy="9.5" r="2.1" fill="currentColor" className="logo-dot" />
    </svg>
  );
}

/** Logo completo: marca + wordmark "DevFlow". */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="group flex items-center gap-2.5 select-none">
      <LogoMark className="transition-transform duration-500 group-hover:rotate-[8deg]" />
      {!compact && (
        <span className="text-lg font-bold tracking-tight">
          Dev<span className="text-muted-foreground">Flow</span>
        </span>
      )}
    </div>
  );
}
