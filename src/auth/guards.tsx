import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { rotaDeRetornoSegura } from '../lib/routes';
import { Loading } from '../components/Loading';

/**
 * Enquanto a sessão não foi lida, ninguém é redirecionado.
 * É o que evita o "pisca" que mandaria um aluno logado para /entrar.
 */

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, initialized, aal } = useAuth();
  const local = useLocation();

  if (!initialized) return <Loading />;

  if (!session) {
    const destino = `${local.pathname}${local.search}`;
    return <Navigate to="/entrar" replace state={{ from: destino }} />;
  }

  // Tem 2FA cadastrado mas ainda não confirmou nesta sessão.
  if (aal.nextLevel === 'aal2' && aal.currentLevel === 'aal1') {
    return <Navigate to="/verificacao-2fa" replace state={{ from: local.pathname }} />;
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { session, initialized, aal } = useAuth();
  const local = useLocation();

  if (!initialized) return <Loading />;

  if (session) {
    // Sessão pela metade (falta o segundo fator): deixa concluir.
    if (aal.nextLevel === 'aal2' && aal.currentLevel === 'aal1') {
      return <Navigate to="/verificacao-2fa" replace />;
    }
    const estado = local.state as { from?: string } | null;
    return <Navigate to={rotaDeRetornoSegura(estado?.from) ?? '/area-do-aluno'} replace />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { session, profile, aal, initialized, loading } = useAuth();

  if (!initialized || loading) return <Loading />;
  if (!session) return <Navigate to="/entrar" replace state={{ from: '/admin' }} />;

  // Não é admin: nem revela que a rota existe de outra forma.
  if (profile?.role !== 'admin') return <Navigate to="/area-do-aluno" replace />;

  // Admin sem segundo fator confirmado precisa ativar/confirmar antes.
  if (aal.currentLevel !== 'aal2') {
    return <Navigate to="/area-do-aluno/seguranca" replace state={{ exigir2fa: true }} />;
  }

  return <>{children}</>;
}
