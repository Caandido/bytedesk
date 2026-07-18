import {
  PROJECT_STATUS_LABELS,
  PROJECT_PRIORITY_LABELS,
  type ProjectStatus,
  type ProjectPriority,
} from '@devflow/shared';
import { Badge, type BadgeProps } from '@/components/ui/badge';

/** Cor do badge de status do projeto (tokens do design system). */
const STATUS_VARIANT: Record<ProjectStatus, BadgeProps['variant']> = {
  PLANNING: 'default',
  IN_PROGRESS: 'info',
  PAUSED: 'warning',
  COMPLETED: 'primary',
  ARCHIVED: 'outline',
};

/** Cor do badge de prioridade. */
const PRIORITY_VARIANT: Record<ProjectPriority, BadgeProps['variant']> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'danger',
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {PROJECT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function ProjectPriorityBadge({
  priority,
}: {
  priority: ProjectPriority;
}) {
  return (
    <Badge variant={PRIORITY_VARIANT[priority]}>
      {PROJECT_PRIORITY_LABELS[priority]}
    </Badge>
  );
}
