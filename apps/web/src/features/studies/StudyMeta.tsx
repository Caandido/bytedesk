import {
  STUDY_STATUS_LABELS,
  STUDY_LEVEL_LABELS,
  type StudyStatus,
  type StudyLevel,
} from '@devflow/shared';
import { Badge, type BadgeProps } from '@/components/ui/badge';

/** Mapeia o status do estudo para a cor do badge (tokens do design system). */
const STATUS_VARIANT: Record<StudyStatus, BadgeProps['variant']> = {
  PLANNED: 'default',
  IN_PROGRESS: 'info',
  PAUSED: 'warning',
  COMPLETED: 'primary',
};

export function StudyStatusBadge({ status }: { status: StudyStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>{STUDY_STATUS_LABELS[status]}</Badge>
  );
}

export function StudyLevelBadge({ level }: { level: StudyLevel }) {
  return <Badge variant="outline">{STUDY_LEVEL_LABELS[level]}</Badge>;
}
