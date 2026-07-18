import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth.api';
import { useAuthStore } from '@/stores/auth';

/** Mutation de login: em caso de sucesso, aplica a sessão no store. */
export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => setAuth(response),
  });
}

/** Mutation de registro: em caso de sucesso, aplica a sessão no store. */
export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => setAuth(response),
  });
}
