import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { User, Clock } from 'lucide-react';
import type { Task } from '@devflow/shared';
import { cn } from '@/lib/utils';
import { TaskPriorityBadge } from './TaskPriorityBadge';

interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
  /** Renderização estática (usada no DragOverlay, sem listeners). */
  overlay?: boolean;
}

/** Card de tarefa arrastável (sortable). Clique abre o modal de edição. */
export function TaskCard({ task, onOpen, overlay = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'task', task } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      className={cn(
        'cursor-grab touch-none rounded-md border border-border bg-background p-3 text-left shadow-sm transition-colors hover:border-primary/50 active:cursor-grabbing',
        isDragging && !overlay && 'opacity-40',
        overlay && 'cursor-grabbing shadow-lg',
      )}
    >
      <p className="mb-2 text-sm font-medium leading-snug">{task.title}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <TaskPriorityBadge priority={task.priority} />
        {task.assignee && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="size-3" /> {task.assignee}
          </span>
        )}
        {(task.estimatedHours > 0 || task.spentHours > 0) && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" /> {task.spentHours}/{task.estimatedHours}
            h
          </span>
        )}
      </div>
    </div>
  );
}
