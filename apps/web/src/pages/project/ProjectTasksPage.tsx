import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Loader2 } from 'lucide-react';
import {
  TASK_STATUS_ORDER,
  TASK_STATUS_LABELS,
  taskStatusSchema,
  type Task,
  type TaskStatus,
} from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { TaskCard } from '@/features/tasks/TaskCard';
import { TaskDialog } from '@/features/tasks/TaskDialog';
import {
  useTasks,
  useCreateTask,
  useMoveTask,
} from '@/features/tasks/useTasks';
import type { ProjectOutletContext } from './ProjectLayout';

type Board = Record<TaskStatus, Task[]>;

const emptyBoard = (): Board =>
  TASK_STATUS_ORDER.reduce((acc, s) => ({ ...acc, [s]: [] }), {} as Board);

const isStatus = (id: string): id is TaskStatus =>
  taskStatusSchema.safeParse(id).success;

function groupByStatus(tasks: Task[]): Board {
  const board = emptyBoard();
  for (const task of tasks) board[task.status].push(task);
  for (const s of TASK_STATUS_ORDER)
    board[s].sort((a, b) => a.position - b.position);
  return board;
}

/** Aba "Tarefas": quadro Kanban com drag-and-drop entre e dentro das colunas. */
export function ProjectTasksPage() {
  const { project } = useOutletContext<ProjectOutletContext>();
  const projectId = project.id;

  const tasks = useTasks(projectId);
  const moveTask = useMoveTask(projectId);

  const [board, setBoard] = useState<Board>(emptyBoard);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);

  // Ref com o estado atual do board para leitura dentro dos handlers de DnD.
  const boardRef = useRef(board);
  boardRef.current = board;
  // Ref com o "arrastando?" para não ressincronizar o board no meio do arraste.
  const draggingRef = useRef(false);

  // Sincroniza o board com o servidor sempre que os dados mudam (e não arrastando).
  useEffect(() => {
    if (draggingRef.current) return;
    setBoard(groupByStatus(tasks.data ?? []));
  }, [tasks.data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const columnOf = (id: string, b: Board): TaskStatus | null => {
    if (isStatus(id)) return id;
    return TASK_STATUS_ORDER.find((s) => b[s].some((t) => t.id === id)) ?? null;
  };

  const handleDragStart = (e: DragStartEvent) => {
    draggingRef.current = true;
    const id = String(e.active.id);
    const col = columnOf(id, boardRef.current);
    if (col) setActiveTask(boardRef.current[col].find((t) => t.id === id) ?? null);
  };

  // Move a tarefa entre colunas em tempo real (feedback visual durante o arraste).
  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const b = boardRef.current;
    const sourceCol = columnOf(activeId, b);
    const targetCol = isStatus(overId) ? overId : columnOf(overId, b);
    if (!sourceCol || !targetCol || sourceCol === targetCol) return;

    setBoard((prev) => {
      const sourceItems = [...prev[sourceCol]];
      const idx = sourceItems.findIndex((t) => t.id === activeId);
      if (idx < 0) return prev;
      const [moved] = sourceItems.splice(idx, 1);
      const targetItems = [...prev[targetCol]];
      let insertIndex = targetItems.length;
      if (!isStatus(overId)) {
        const overIdx = targetItems.findIndex((t) => t.id === overId);
        if (overIdx >= 0) insertIndex = overIdx;
      }
      targetItems.splice(insertIndex, 0, { ...moved, status: targetCol });
      return { ...prev, [sourceCol]: sourceItems, [targetCol]: targetItems };
    });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    draggingRef.current = false;
    setActiveTask(null);
    const { active, over } = e;
    if (!over) {
      // Solto fora de qualquer coluna — ressincroniza com o servidor.
      setBoard(groupByStatus(tasks.data ?? []));
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const b = boardRef.current;
    const col = columnOf(activeId, b);
    if (!col) return;

    const items = b[col];
    const oldIndex = items.findIndex((t) => t.id === activeId);
    let newIndex = isStatus(overId)
      ? items.length - 1
      : items.findIndex((t) => t.id === overId);
    if (newIndex < 0) newIndex = oldIndex;

    let finalItems = items;
    if (oldIndex !== newIndex) {
      finalItems = arrayMove(items, oldIndex, newIndex);
      setBoard((prev) => ({ ...prev, [col]: finalItems }));
    }

    const position = finalItems.findIndex((t) => t.id === activeId);
    moveTask.mutate({ taskId: activeId, input: { status: col, position } });
  };

  if (tasks.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando tarefas…
      </p>
    );
  }
  if (tasks.isError) {
    return <p className="text-sm text-danger">Erro ao carregar as tarefas.</p>;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TASK_STATUS_ORDER.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={board[status]}
              projectId={projectId}
              onOpen={setEditing}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} onOpen={() => {}} overlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        projectId={projectId}
        task={editing}
        onClose={() => setEditing(null)}
      />
    </>
  );
}

// ─── Coluna ─────────────────────────────────────────────────────────────────────

function Column({
  status,
  tasks,
  projectId,
  onOpen,
}: {
  status: TaskStatus;
  tasks: Task[];
  projectId: string;
  onOpen: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const createTask = useCreateTask(projectId);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    createTask.mutate(
      { title: trimmed, status },
      {
        onSuccess: () => {
          setTitle('');
          setAdding(false);
        },
      },
    );
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-lg border border-border bg-sidebar/40 p-2 transition-colors',
        isOver && 'border-primary/50 bg-sidebar/70',
      )}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold">{TASK_STATUS_LABELS[status]}</h3>
        <span className="rounded bg-muted px-1.5 text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-2 flex-1 flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={onOpen} />
          ))}
        </div>
      </SortableContext>

      {adding ? (
        <form onSubmit={handleAdd} className="mt-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => !title.trim() && setAdding(false)}
            placeholder="Título da tarefa…"
            maxLength={200}
            autoFocus
          />
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Plus className="size-3.5" /> Adicionar tarefa
        </button>
      )}
    </div>
  );
}
