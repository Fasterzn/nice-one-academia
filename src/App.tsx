import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { AdminRoute, GuestRoute, ProtectedRoute } from './auth/guards';
import { Loading } from './components/Loading';
import { isSupabaseConfigured } from './lib/supabase';
import Home from './pages/Home';

// Tudo que não é o site público entra em chunks separados: a home não carrega
// nada de autenticação no bundle inicial.
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const Verify = lazy(() => import('./pages/auth/Verify'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const MfaChallenge = lazy(() => import('./pages/auth/MfaChallenge'));
const Dashboard = lazy(() => import('./pages/aluno/Dashboard'));
const Profile = lazy(() => import('./pages/aluno/Profile'));
const Security = lazy(() => import('./pages/aluno/Security'));
const Students = lazy(() => import('./pages/admin/Students'));
const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * Rola até a seção pedida ao chegar de outra rota.
 * O alvo vem no state da navegação (SectionLink) ou na âncora da URL.
 */
function ScrollToHash() {
  const { pathname, hash, state } = useLocation();
  const secao = (state as { secao?: string } | null)?.secao ?? (hash ? hash.slice(1) : null);

  useEffect(() => {
    if (!secao) {
      window.scrollTo(0, 0);
      return;
    }
    // Espera a seção existir (a home carrega em chunk separado).
    let tentativas = 0;
    const procurar = () => {
      const alvo = document.getElementById(secao);
      if (alvo) {
        alvo.scrollIntoView();
        return;
      }
      if (tentativas < 20) {
        tentativas += 1;
        requestAnimationFrame(procurar);
      }
    };
    requestAnimationFrame(procurar);
  }, [pathname, secao]);

  return null;
}

/**
 * No servidor usamos URLs normais. Aberto como arquivo (o HTML único que vai
 * para o celular), o caminho é o do arquivo — aí o roteador precisa ser por
 * hash, senão tudo cairia no 404.
 */
const Router =
  typeof window !== 'undefined' && window.location.protocol === 'file:'
    ? HashRouter
    : BrowserRouter;

/**
 * Em subpasta (GitHub Pages) o roteador precisa saber o prefixo, senão "/" não
 * casa com "/nice-one-academia/". O HashRouter ignora basename, e com ele o
 * BASE_URL é "./" — por isso o valor só vai para o BrowserRouter.
 */
const basename = Router === HashRouter ? undefined : import.meta.env.BASE_URL;

export default function App() {
  return (
    <Router basename={basename}>
      <AuthProvider>
        <ScrollToHash />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Sem Supabase configurado não há como autenticar ninguém: as
                rotas da Área do Aluno saem do ar e caem no 404, e a Navbar
                esconde o acesso. Religa sozinho quando o build tiver as
                variáveis de ambiente. */}
            {isSupabaseConfigured && (
              <>
            {/* Só para quem está deslogado */}
            <Route
              path="/entrar"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/cadastro"
              element={
                <GuestRoute>
                  <Signup />
                </GuestRoute>
              }
            />
            <Route
              path="/verificar"
              element={
                <GuestRoute>
                  <Verify />
                </GuestRoute>
              }
            />
            {/* Sem GuestRoute: ao validar o código de recuperação nasce uma
                sessão, e a guarda tiraria o aluno da tela antes de ele
                escolher a senha nova. A própria página trata quem já está
                logado. */}
            <Route path="/esqueci-senha" element={<ForgotPassword />} />

            {/* Segundo fator: a sessão existe, mas ainda está em AAL1 */}
            <Route path="/verificacao-2fa" element={<MfaChallenge />} />

            {/* Área do aluno */}
            <Route
              path="/area-do-aluno"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/area-do-aluno/perfil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/area-do-aluno/seguranca"
              element={
                <ProtectedRoute>
                  <Security />
                </ProtectedRoute>
              }
            />

            {/* Admin: exige papel admin e segundo fator confirmado */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Students />
                </AdminRoute>
              }
            />
              </>
            )}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}
