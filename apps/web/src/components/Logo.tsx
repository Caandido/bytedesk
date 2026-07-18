import { cn } from '@/lib/utils';

/**
 * Marca do ByteDesk: um glifo de terminal `>_` (prompt do desenvolvedor) num
 * quadrado preenchido de alto contraste — inverte com o tema (claro/escuro).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('size-8', className)}
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8.5"
        className="fill-foreground"
      />
      <path
        d="M9.5 11 L14.5 16 L9.5 21"
        fill="none"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-background logo-draw"
      />
      <rect
        x="16.5"
        y="19.4"
        width="7"
        height="2.6"
        rx="1.3"
        className="fill-background logo-dot"
      />
    </svg>
  );
}

/** Logo completo: marca + wordmark "ByteDesk". */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="group flex select-none items-center gap-2.5">
      <LogoMark className="transition-transform duration-500 group-hover:rotate-[8deg]" />
      {!compact && (
        <span className="text-lg font-bold tracking-tight">
          Byte<span className="text-muted-foreground">Desk</span>
        </span>
      )}
    </div>
  );
}
