import {
  LayoutDashboard,
  GraduationCap,
  Map,
  FolderKanban,
  BookOpen,
  NotebookPen,
  Bug,
  BarChart3,
  GitBranch,
  type LucideIcon,
} from 'lucide-react';

/** Definição de um item de navegação (módulo da spec). */
export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

/**
 * Módulos de topo do DevFlow. Na fundação todos apontam para páginas placeholder;
 * cada um será substituído pela implementação real do módulo correspondente.
 */
export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Estudos', path: '/estudos', icon: GraduationCap },
  { label: 'Roadmaps', path: '/roadmaps', icon: Map },
  { label: 'Projetos', path: '/projetos', icon: FolderKanban },
  { label: 'Conhecimento', path: '/conhecimento', icon: BookOpen },
  { label: 'Banco de Erros', path: '/erros', icon: Bug },
  { label: 'Diário', path: '/diario', icon: NotebookPen },
  { label: 'Estatísticas', path: '/estatisticas', icon: BarChart3 },
  { label: 'Git', path: '/git', icon: GitBranch },
];
