import { TASK_PRIORITY_LABELS, type TaskPriority } from '@devflow/shared';
import { Badge, type BadgeProps } from '@/components/ui/badge';

/** Cor do badge de prioridade da tarefa (tokens do design system). */
const PRIORITY_VARIANT: Record<TaskPriority, BadgeProps['variant']> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'danger',
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge variant={PRIORITY_VARIANT[priority]}>
      {TASK_PRIORITY_LABELS[priority]}
    </Badge>
  );
}
