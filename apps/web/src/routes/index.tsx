import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';

/**
 * Roteador da aplicação. As páginas são carregadas sob demanda (code-splitting via
 * React.lazy) — cada rota vira um chunk próprio, então libs pesadas (react-markdown,
 * @dnd-kit) só baixam quando a página que as usa é aberta. O AppLayout (shell) é
 * eager; os `Suspense` ficam no AppLayout e no ProjectLayout.
 *
 * As páginas usam named exports, daí o wrapper `.then(m => ({ default: m.X }))`.
 */
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const StudiesPage = lazy(() =>
  import('@/pages/StudiesPage').then((m) => ({ default: m.StudiesPage })),
);
const StudyFormPage = lazy(() =>
  import('@/pages/StudyFormPage').then((m) => ({ default: m.StudyFormPage })),
);
const StudyDetailPage = lazy(() =>
  import('@/pages/StudyDetailPage').then((m) => ({
    default: m.StudyDetailPage,
  })),
);
const ProjectsPage = lazy(() =>
  import('@/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
);
const ProjectFormPage = lazy(() =>
  import('@/pages/ProjectFormPage').then((m) => ({
    default: m.ProjectFormPage,
  })),
);
const ProjectLayout = lazy(() =>
  import('@/pages/project/ProjectLayout').then((m) => ({
    default: m.ProjectLayout,
  })),
);
const ProjectOverviewPage = lazy(() =>
  import('@/pages/project/ProjectOverviewPage').then((m) => ({
    default: m.ProjectOverviewPage,
  })),
);
const ProjectTasksPage = lazy(() =>
  import('@/pages/project/ProjectTasksPage').then((m) => ({
    default: m.ProjectTasksPage,
  })),
);
const ProjectBugsPage = lazy(() =>
  import('@/pages/project/ProjectBugsPage').then((m) => ({
    default: m.ProjectBugsPage,
  })),
);
const ProjectIdeasPage = lazy(() =>
  import('@/pages/project/ProjectIdeasPage').then((m) => ({
    default: m.ProjectIdeasPage,
  })),
);
const ProjectVersionsPage = lazy(() =>
  import('@/pages/project/ProjectVersionsPage').then((m) => ({
    default: m.ProjectVersionsPage,
  })),
);
const ProjectDocsPage = lazy(() =>
  import('@/pages/project/ProjectDocsPage').then((m) => ({
    default: m.ProjectDocsPage,
  })),
);
const RoadmapsPage = lazy(() =>
  import('@/pages/RoadmapsPage').then((m) => ({ default: m.RoadmapsPage })),
);
const RoadmapFormPage = lazy(() =>
  import('@/pages/RoadmapFormPage').then((m) => ({
    default: m.RoadmapFormPage,
  })),
);
const RoadmapDetailPage = lazy(() =>
  import('@/pages/RoadmapDetailPage').then((m) => ({
    default: m.RoadmapDetailPage,
  })),
);
const ConhecimentoPage = lazy(() =>
  import('@/pages/ConhecimentoPage').then((m) => ({
    default: m.ConhecimentoPage,
  })),
);
const EstatisticasPage = lazy(() =>
  import('@/pages/EstatisticasPage').then((m) => ({
    default: m.EstatisticasPage,
  })),
);
const GitPage = lazy(() =>
  import('@/pages/GitPage').then((m) => ({ default: m.GitPage })),
);
const DiarioPage = lazy(() =>
  import('@/pages/DiarioPage').then((m) => ({ default: m.DiarioPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'estudos', element: <StudiesPage /> },
      { path: 'estudos/novo', element: <StudyFormPage /> },
      { path: 'estudos/:id', element: <StudyDetailPage /> },
      { path: 'estudos/:id/editar', element: <StudyFormPage /> },
      { path: 'projetos', element: <ProjectsPage /> },
      { path: 'projetos/novo', element: <ProjectFormPage /> },
      { path: 'projetos/:id/editar', element: <ProjectFormPage /> },
      {
        path: 'projetos/:id',
        element: <ProjectLayout />,
        children: [
          { index: true, element: <ProjectOverviewPage /> },
          { path: 'tarefas', element: <ProjectTasksPage /> },
          { path: 'bugs', element: <ProjectBugsPage /> },
          { path: 'ideias', element: <ProjectIdeasPage /> },
          { path: 'versoes', element: <ProjectVersionsPage /> },
          { path: 'docs', element: <ProjectDocsPage /> },
        ],
      },
      { path: 'roadmaps', element: <RoadmapsPage /> },
      { path: 'roadmaps/novo', element: <RoadmapFormPage /> },
      { path: 'roadmaps/:id', element: <RoadmapDetailPage /> },
      { path: 'roadmaps/:id/editar', element: <RoadmapFormPage /> },
      { path: 'conhecimento', element: <ConhecimentoPage /> },
      { path: 'diario', element: <DiarioPage /> },
      { path: 'estatisticas', element: <EstatisticasPage /> },
      { path: 'git', element: <GitPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
