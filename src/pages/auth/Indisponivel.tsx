import { Link } from 'react-router-dom';
import { AuthLayout, StatusMessage } from '../../components/AuthLayout';

/** Mostrado quando as variáveis do Supabase não estão configuradas. */
export function IndisponivelAviso() {
  return (
    <AuthLayout
      title="Área do aluno"
      subtitle="Enquanto isso, fale com a sua unidade pelo WhatsApp."
    >
      <StatusMessage type="info">Área do aluno temporariamente indisponível.</StatusMessage>
      <Link className="auth__link-button" to="/">
        Voltar ao site
      </Link>
    </AuthLayout>
  );
}
