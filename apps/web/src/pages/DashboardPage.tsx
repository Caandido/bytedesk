import { Link } from 'react-router-dom';
import {
  FolderKanban,
  GraduationCap,
  ListChecks,
  Bug as BugIcon,
  Clock,
  Loader2,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import type { DashboardData } from '@devflow/shared';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TaskPriorityBadge } from '@/features/tasks/TaskPriorityBadge';
import { BugSeverityBadge } from '@/features/bugs/BugMeta';
import { useDashboard } from '@/features/dashboard/useDashboard';

/**
 * Tela inicial com dados reais agregados dos módulos (via GET /api/dashboard):
 * estatísticas, estudos em andamento, próximas tarefas e bugs abertos.
 */
export function DashboardPage() {
  const dashboard = useDashboard();

  if (dashboard.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando dashboard…
      </p>
    );
  }
  if (dashboard.isError || !dashboard.data) {
    return <p className="text-sm text-danger">Erro ao carregar o dashboard.</p>;
  }

  const d = dashboard.data;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu ambiente.</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={FolderKanban}
          value={d.projects.active}
          label="Projetos ativos"
          hint={`${d.projects.total} no total`}
        />
        <StatCard
          icon={GraduationCap}
          value={d.studies.inProgress}
          label="Estudos em andamento"
          hint={`${d.studies.total} no total`}
        />
        <StatCard
          icon={ListChecks}
          value={d.tasks.pending}
          label="Tarefas pendentes"
          hint={`${d.tasks.done} concluídas`}
        />
        <StatCard
          icon={BugIcon}
          value={d.bugs.open}
          label="Bugs abertos"
          hint={`${d.bugs.resolved} resolvidos`}
          danger={d.bugs.open > 0}
        />
        <StatCard
          icon={Clock}
          value={`${d.studies.hoursStudied}h`}
          label="Horas estudadas"
        />
      </div>

      {/* Listas */}
      <div className="grid gap-4 lg:grid-cols-3">
        <StudiesInProgress studies={d.recentStudies} />
        <UpcomingTasks tasks={d.upcomingTasks} />
        <OpenBugs bugs={d.recentBugs} />
      </div>
    </div>
  );
}

// ─── Cards de estatística ────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  hint,
  danger,
}: {
  icon: LucideIcon;
  value: number | string;
  label: string;
  hint?: string;
  danger?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <Icon
          className={danger ? 'size-5 text-danger' : 'size-5 text-primary'}
        />
        <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Listas ──────────────────────────────────────────────────────────────────

function StudiesInProgress({
  studies,
}: {
  studies: DashboardData['recentStudies'];
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Estudos em andamento</CardTitle>
        <Link
          to="/estudos"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Ver todos <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {studies.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum estudo em andamento.
          </p>
        )}
        {studies.map((s) => (
          <Link
            key={s.id}
            to={`/estudos/${s.id}`}
            className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 transition-colors hover:border-primary/50"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{s.name}</p>
              {s.objectivesTotal > 0 && (
                <p className="text-xs text-muted-foreground">
                  {s.objectivesDone}/{s.objectivesTotal} objetivos
                </p>
              )}
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {s.hoursStudied}h
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function UpcomingTasks({ tasks }: { tasks: DashboardData['upcomingTasks'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Próximas tarefas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma tarefa pendente.
          </p>
        )}
        {tasks.map((t) => (
          <Link
            key={t.id}
            to={`/projetos/${t.projectId}/tarefas`}
            className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 transition-colors hover:border-primary/50"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{t.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {t.projectName}
              </p>
            </div>
            <TaskPriorityBadge priority={t.priority} />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function OpenBugs({ bugs }: { bugs: DashboardData['recentBugs'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bugs abertos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {bugs.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum bug aberto. 🎉</p>
        )}
        {bugs.map((b) => (
          <Link
            key={b.id}
            to={`/projetos/${b.projectId}/bugs`}
            className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 transition-colors hover:border-primary/50"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{b.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {b.projectName}
              </p>
            </div>
            <BugSeverityBadge severity={b.severity} />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
