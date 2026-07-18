import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { StudiesPage } from '@/pages/StudiesPage';
import { StudyFormPage } from '@/pages/StudyFormPage';
import { StudyDetailPage } from '@/pages/StudyDetailPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectFormPage } from '@/pages/ProjectFormPage';
import { ProjectLayout } from '@/pages/project/ProjectLayout';
import { ProjectOverviewPage } from '@/pages/project/ProjectOverviewPage';
import { ProjectTasksPage } from '@/pages/project/ProjectTasksPage';
import { ProjectBugsPage } from '@/pages/project/ProjectBugsPage';
import { ProjectDocsPage } from '@/pages/project/ProjectDocsPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * Roteador da aplicação. O Dashboard já é real (prova de integração); os demais
 * módulos usam páginas placeholder até serem implementados.
 */
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
          { path: 'docs', element: <ProjectDocsPage /> },
        ],
      },
      {
        path: 'roadmaps',
        element: (
          <PlaceholderPage
            title="Roadmaps"
            description="Trilhas de aprendizado com progresso e recursos."
          />
        ),
      },
      {
        path: 'conhecimento',
        element: (
          <PlaceholderPage
            title="Conhecimento"
            description="Sua wiki pessoal de programação."
          />
        ),
      },
      {
        path: 'estatisticas',
        element: (
          <PlaceholderPage
            title="Estatísticas"
            description="Métricas de produtividade e progresso."
          />
        ),
      },
      {
        path: 'git',
        element: (
          <PlaceholderPage
            title="Git"
            description="Informações de repositório, branches e versões."
          />
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
