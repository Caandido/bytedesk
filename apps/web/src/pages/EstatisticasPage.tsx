import {
  FolderKanban,
  CheckCircle2,
  GraduationCap,
  Clock,
  Code2,
  ListChecks,
  Bug as BugIcon,
  Flame,
  CalendarDays,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart } from '@/components/BarChart';
import { useStats } from '@/features/stats/useStats';

/** Estatísticas agregadas: KPIs + gráficos de distribuição e tecnologias. */
export function EstatisticasPage() {
  const stats = useStats();

  if (stats.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando estatísticas…
      </p>
    );
  }
  if (stats.isError || !stats.data) {
    return <p className="text-sm text-danger">Erro ao carregar as estatísticas.</p>;
  }

  const s = stats.data;
  const roadmapPct = s.roadmaps.itemsTotal
    ? Math.round((s.roadmaps.itemsDone / s.roadmaps.itemsTotal) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Estatísticas</h1>
        <p className="text-muted-foreground">
          Métricas de produtividade e progresso.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Tile
          icon={FolderKanban}
          value={s.projects.active}
          label="Projetos ativos"
          hint={`${s.projects.total} no total`}
        />
        <Tile
          icon={CheckCircle2}
          value={s.projects.completed}
          label="Projetos finalizados"
        />
        <Tile
          icon={GraduationCap}
          value={s.studies.inProgress}
          label="Estudos em andamento"
          hint={`${s.studies.completed} concluídos`}
        />
        <Tile
          icon={Clock}
          value={`${s.studies.hoursStudied}h`}
          label="Horas estudadas"
        />
        <Tile
          icon={Code2}
          value={`${s.tasks.hoursSpent}h`}
          label="Horas programadas"
        />
        <Tile
          icon={ListChecks}
          value={s.tasks.done}
          label="Tarefas concluídas"
          hint={`${s.tasks.total} no total`}
        />
        <Tile
          icon={BugIcon}
          value={s.bugs.resolved}
          label="Bugs resolvidos"
          hint={`${s.bugs.open} abertos`}
        />
        <Tile
          icon={Flame}
          value={s.activity.currentStreak}
          label="Sequência (dias)"
          hint={`${s.activity.activeDays} dias ativos`}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Tecnologias mais usadas">
          <BarChart
            data={s.technologies}
            emptyLabel="Nenhuma tecnologia registrada em projetos/estudos."
          />
        </ChartCard>

        <ChartCard title="Estudos por status">
          <BarChart data={s.studyByStatus} barClass="bg-info" />
        </ChartCard>

        <ChartCard title="Tarefas por coluna">
          <BarChart data={s.taskByStatus} barClass="bg-primary" />
        </ChartCard>

        <ChartCard title="Bugs por severidade">
          <BarChart data={s.bugBySeverity} barClass="bg-warning" />
        </ChartCard>
      </div>

      {/* Resumo de conteúdo */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ContentSummary
          icon={CalendarDays}
          title="Roadmaps"
          primary={`${s.roadmaps.total}`}
          detail={`${s.roadmaps.itemsDone}/${s.roadmaps.itemsTotal} itens · ${roadmapPct}%`}
        />
        <ContentSummary
          icon={GraduationCap}
          title="Estudos"
          primary={`${s.studies.total}`}
          detail={`${s.studies.completed} concluídos`}
        />
        <ContentSummary
          icon={BugIcon}
          title="Conhecimento"
          primary={`${s.wiki.total}`}
          detail={`${s.wiki.favorites} favoritas`}
        />
      </div>
    </div>
  );
}

function Tile({
  icon: Icon,
  value,
  label,
  hint,
}: {
  icon: LucideIcon;
  value: number | string;
  label: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <Icon className="size-5 text-primary" />
        <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {hint && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ContentSummary({
  icon: Icon,
  title,
  primary,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  primary: string;
  detail: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <Icon className="size-8 text-primary" />
        <div>
          <p className="text-xl font-bold tabular-nums">{primary}</p>
          <p className="text-xs font-medium">{title}</p>
          <p className="text-[11px] text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
