import {
  BUG_SEVERITY_LABELS,
  BUG_STATUS_LABELS,
  type BugSeverity,
  type BugStatus,
} from '@devflow/shared';
import { Badge, type BadgeProps } from '@/components/ui/badge';

const SEVERITY_VARIANT: Record<BugSeverity, BadgeProps['variant']> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'danger',
};

const STATUS_VARIANT: Record<BugStatus, BadgeProps['variant']> = {
  OPEN: 'danger',
  IN_PROGRESS: 'info',
  RESOLVED: 'primary',
  CLOSED: 'default',
  WONT_FIX: 'outline',
};

export function BugSeverityBadge({ severity }: { severity: BugSeverity }) {
  return (
    <Badge variant={SEVERITY_VARIANT[severity]}>
      {BUG_SEVERITY_LABELS[severity]}
    </Badge>
  );
}

export function BugStatusBadge({ status }: { status: BugStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{BUG_STATUS_LABELS[status]}</Badge>;
}
