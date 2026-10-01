import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { AlunoLayout } from '../aluno/AlunoLayout';
import { StatusMessage } from '../../components/AuthLayout';
import { Button } from '../../components/Button';
import { listarAlunos } from '../../auth/api';
import { traduzirErro } from '../../lib/authErrors';
import type { Profile } from '../../types/database.types';
import { units } from '../../data/units';
import './Students.css';

const POR_PAGINA = 20;

const formatador = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

function nomeDaUnidade(id: number | null): string {
  if (!id) return '—';
  return units.find((unidade) => unidade.id === id)?.name ?? `Unidade ${id}`;
}

export default function Students() {
  const [busca, setBusca] = useState('');
  const [termo, setTermo] = useState('');
  const [pagina, setPagina] = useState(1);
  const [alunos, setAlunos] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    listarAlunos(termo, pagina, POR_PAGINA)
      .then((resultado) => {
        if (!ativo) return;
        setAlunos(resultado.alunos);
        setTotal(resultado.total);
        setErro('');
      })
      .catch((erroSupabase) => {
        if (ativo) setErro(traduzirErro(erroSupabase));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [termo, pagina]);

  const ultimaPagina = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <AlunoLayout title="Alunos">
      <section className="card">
        <form
          className="admin__busca"
          onSubmit={(evento) => {
            evento.preventDefault();
            setCarregando(true);
            setPagina(1);
            setTermo(busca);
          }}
        >
          <div className="field admin__busca-campo">
            <label className="field__label" htmlFor="admin-busca">
              Buscar por nome
            </label>
            <input
              id="admin-busca"
              className="field__input"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              autoComplete="off"
              placeholder="Nome do aluno"
            />
          </div>
          <Button type="submit">
            <Search size={15} aria-hidden="true" />
            Buscar
          </Button>
        </form>

        {erro && <StatusMessage type="error">{erro}</StatusMessage>}

        <p className="card__text" aria-live="polite">
          {carregando ? 'Carregando…' : `${total} aluno${total === 1 ? '' : 's'} cadastrado${total === 1 ? '' : 's'}.`}
        </p>

        <div className="admin__tabela-wrap">
          <table className="admin__tabela">
            <caption className="visually-hidden">Lista de alunos cadastrados</caption>
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Unidade</th>
                <th scope="col">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.id}>
                  <th scope="row">{aluno.full_name}</th>
                  <td>{nomeDaUnidade(aluno.preferred_unit)}</td>
                  <td>{formatador.format(new Date(aluno.created_at))}</td>
                </tr>
              ))}
              {!carregando && alunos.length === 0 && (
                <tr>
                  <td colSpan={3}>Nenhum aluno encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {ultimaPagina > 1 && (
          <div className="admin__paginacao">
            <Button
              variant="outline"
              onClick={() => {
                setCarregando(true);
                setPagina((atual) => Math.max(1, atual - 1));
              }}
              disabled={pagina <= 1 || carregando}
            >
              Anterior
            </Button>
            <span className="card__text">
              Página {pagina} de {ultimaPagina}
            </span>
            <Button
              variant="outline"
              onClick={() => {
                setCarregando(true);
                setPagina((atual) => Math.min(ultimaPagina, atual + 1));
              }}
              disabled={pagina >= ultimaPagina || carregando}
            >
              Próxima
            </Button>
          </div>
        )}
      </section>
    </AlunoLayout>
  );
}
