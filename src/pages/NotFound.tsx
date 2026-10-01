import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Página não encontrada | Nice One Academia';
  }, []);

  return (
    <AuthLayout
      title="Página não encontrada"
      subtitle="O endereço que você abriu não existe ou foi movido."
      documentTitle="Página não encontrada"
      footer={
        <p>
          <Link to="/">Voltar para o início</Link> · <Link to="/#unidades">Ver unidades</Link>
        </p>
      }
    >
      <p className="card__text">
        Se você chegou aqui por um link antigo, fale com a sua unidade pelo WhatsApp — a equipe
        ajuda rapidinho.
      </p>
    </AuthLayout>
  );
}
