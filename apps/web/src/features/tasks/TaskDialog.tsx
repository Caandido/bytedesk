import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import {
  createTaskSchema,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskPriority,
  type UpdateTaskInput,
} from '@devflow/shared';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUpdateTask, useDeleteTask } from './useTasks';

interface TaskDialogProps {
  projectId: string;
  task: Task | null;
  onClose: () => void;
}

/** Modal de edição de uma tarefa (campos + exclusão). */
export function TaskDialog({ projectId, task, onClose }: TaskDialogProps) {
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assignee, setAssignee] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [spentHours, setSpentHours] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setAssignee(task.assignee);
      setEstimatedHours(task.estimatedHours ? String(task.estimatedHours) : '');
      setSpentHours(task.spentHours ? String(task.spentHours) : '');
      setError(null);
    }
  }, [task]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!task) return;

    const input: UpdateTaskInput = {
      title,
      description,
      priority,
      assignee,
      estimatedHours: estimatedHours ? Number(estimatedHours) : 0,
      spentHours: spentHours ? Number(spentHours) : 0,
    };

    const parsed = createTaskSchema
      .omit({ status: true })
      .safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
      return;
    }

    updateTask.mutate(
      { taskId: task.id, input: parsed.data },
      { onSuccess: onClose },
    );
  };

  const handleDelete = () => {
    if (!task) return;
    if (window.confirm(`Excluir a tarefa "${task.title}"?`)) {
      deleteTask.mutate(task.id, { onSuccess: onClose });
    }
  };

  return (
    <Dialog open={Boolean(task)} onClose={onClose} title="Editar tarefa">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label>Título</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label>Descrição</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Prioridade</Label>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              {Object.entries(TASK_PRIORITY_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Responsável</Label>
            <Input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Nome"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Tempo estimado (h)</Label>
            <Input
              type="number"
              min={0}
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tempo gasto (h)</Label>
            <Input
              type="number"
              min={0}
              step="0.5"
              value={spentHours}
              onChange={(e) => setSpentHours(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteTask.isPending}
          >
            <Trash2 className="size-4 text-danger" /> Excluir
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={updateTask.isPending}>
              {updateTask.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Salvar
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
