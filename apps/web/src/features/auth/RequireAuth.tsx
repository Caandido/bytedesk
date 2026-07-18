import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';

/**
 * Guarda de rota: sem sessão (token) ou sem workspace ativo, redireciona para o
 * login guardando a rota de origem para voltar depois de autenticar.
 */
export function RequireAuth() {
  const token = useAuthStore((s) => s.token);
  const activeWorkspaceId = useAuthStore((s) => s.activeWorkspaceId);
  const location = useLocation();

  if (!token || !activeWorkspaceId) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}
