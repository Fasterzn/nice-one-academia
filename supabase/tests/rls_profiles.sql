-- ============================================================================
-- Provas de RLS da tabela public.profiles.
-- Rode no SQL Editor do Supabase. Cada bloco imprime OK ou levanta exceção.
--
-- Antes de rodar: crie dois alunos pelo site (A e B) e promova um terceiro a
-- admin, depois troque os e-mails abaixo.
-- ============================================================================

do $$
declare
  id_aluno_a uuid;
  id_aluno_b uuid;
  id_admin   uuid;
  total      int;
begin
  select id into id_aluno_a from auth.users where email = 'ALUNO_A@exemplo.com';
  select id into id_aluno_b from auth.users where email = 'ALUNO_B@exemplo.com';
  select id into id_admin   from auth.users where email = 'ADMIN@exemplo.com';

  if id_aluno_a is null or id_aluno_b is null then
    raise exception 'Crie os usuários de teste antes de rodar este script.';
  end if;

  -- --------------------------------------------------------------------------
  -- 1. Aluno A não lê o perfil do aluno B
  -- --------------------------------------------------------------------------
  set local role authenticated;
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_aluno_a, 'role', 'authenticated', 'aal', 'aal1')::text, true);

  select count(*) into total from public.profiles where id = id_aluno_b;
  if total <> 0 then
    raise exception 'FALHOU: aluno A leu o perfil do aluno B';
  end if;
  raise notice 'OK 1: aluno A não lê o perfil do aluno B';

  -- --------------------------------------------------------------------------
  -- 2. Aluno A lê o próprio perfil
  -- --------------------------------------------------------------------------
  select count(*) into total from public.profiles where id = id_aluno_a;
  if total <> 1 then
    raise exception 'FALHOU: aluno A não lê o próprio perfil';
  end if;
  raise notice 'OK 2: aluno A lê o próprio perfil';

  -- --------------------------------------------------------------------------
  -- 3. Aluno A não altera o perfil do aluno B
  -- --------------------------------------------------------------------------
  update public.profiles set full_name = 'Invasor' where id = id_aluno_b;
  get diagnostics total = row_count;
  if total <> 0 then
    raise exception 'FALHOU: aluno A alterou o perfil do aluno B';
  end if;
  raise notice 'OK 3: aluno A não altera o perfil do aluno B';

  -- --------------------------------------------------------------------------
  -- 4. Aluno não altera o próprio role (privilégio de coluna revogado)
  -- --------------------------------------------------------------------------
  begin
    update public.profiles set role = 'admin' where id = id_aluno_a;
    raise exception 'FALHOU: aluno conseguiu mudar o próprio role';
  exception
    when insufficient_privilege then
      raise notice 'OK 4: aluno não consegue alterar role (permissão negada na coluna)';
  end;

  -- --------------------------------------------------------------------------
  -- 5. anon não lê nada
  -- --------------------------------------------------------------------------
  set local role anon;
  perform set_config('request.jwt.claims', null, true);
  begin
    select count(*) into total from public.profiles;
    if total <> 0 then
      raise exception 'FALHOU: anon leu % linhas', total;
    end if;
    raise notice 'OK 5: anon não lê nada';
  exception
    when insufficient_privilege then
      raise notice 'OK 5: anon sem permissão na tabela';
  end;

  -- --------------------------------------------------------------------------
  -- 6. Admin com AAL2 lê todos os perfis
  -- --------------------------------------------------------------------------
  if id_admin is not null then
    set local role authenticated;
    perform set_config('request.jwt.claims',
      json_build_object('sub', id_admin, 'role', 'authenticated', 'aal', 'aal2')::text, true);

    select count(*) into total from public.profiles;
    if total < 2 then
      raise exception 'FALHOU: admin com AAL2 não leu todos os perfis (viu %)', total;
    end if;
    raise notice 'OK 6: admin com AAL2 lê todos os perfis (%)', total;

    -- 7. Admin sem AAL2 não lê os outros
    perform set_config('request.jwt.claims',
      json_build_object('sub', id_admin, 'role', 'authenticated', 'aal', 'aal1')::text, true);

    select count(*) into total from public.profiles;
    if total > 1 then
      raise exception 'FALHOU: admin sem AAL2 leu % perfis', total;
    end if;
    raise notice 'OK 7: admin sem AAL2 só enxerga o próprio perfil';
  else
    raise notice 'PULADO 6 e 7: nenhum admin definido';
  end if;

  reset role;
end $$;
