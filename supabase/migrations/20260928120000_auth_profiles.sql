-- ============================================================================
-- Nice One Academia — Área do Aluno
-- Perfis, criação automática, papéis e Row Level Security.
-- Idempotente: pode rodar mais de uma vez sem quebrar.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tabela de perfis
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  preferred_unit smallint,
  goal text,
  role text not null default 'aluno',
  marketing_opt_in boolean not null default false,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil do aluno. Uma linha por usuário de auth.users.';
comment on column public.profiles.role is 'aluno ou admin. Nunca vem do cliente — só por UPDATE manual no SQL Editor.';

-- Constraints (criadas só se ainda não existirem)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_full_name_check') then
    alter table public.profiles
      add constraint profiles_full_name_check
      check (char_length(full_name) between 2 and 120);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_phone_check') then
    alter table public.profiles
      add constraint profiles_phone_check
      check (phone is null or (phone ~ '^[0-9]+$' and char_length(phone) between 10 and 13));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_preferred_unit_check') then
    alter table public.profiles
      add constraint profiles_preferred_unit_check
      check (preferred_unit is null or preferred_unit between 1 and 5);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_goal_check') then
    alter table public.profiles
      add constraint profiles_goal_check
      check (goal is null or char_length(goal) <= 300);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_role_check') then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('aluno', 'admin'));
  end if;
end $$;

-- Índices usados pela listagem do admin
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);
create index if not exists profiles_full_name_idx on public.profiles (lower(full_name));

-- ----------------------------------------------------------------------------
-- 2. Criação automática do perfil ao cadastrar
--    À prova de falha: metadado estranho vira null, nunca impede o cadastro.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nome text;
  v_telefone text;
  v_unidade smallint;
  v_marketing boolean;
  v_termos timestamptz;
begin
  -- Nome: obrigatório na tabela, então sempre cai num valor válido.
  v_nome := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  if v_nome is null then
    v_nome := split_part(coalesce(new.email, 'Aluno'), '@', 1);
  end if;
  v_nome := left(v_nome, 120);
  if char_length(v_nome) < 2 then
    v_nome := 'Aluno';
  end if;

  -- Telefone: mantém só dígitos; fora da faixa 10–13 vira null.
  v_telefone := regexp_replace(coalesce(new.raw_user_meta_data ->> 'phone', ''), '\D', '', 'g');
  if char_length(v_telefone) not between 10 and 13 then
    v_telefone := null;
  end if;

  -- Unidade: qualquer coisa inválida vira null.
  begin
    v_unidade := (new.raw_user_meta_data ->> 'preferred_unit')::smallint;
    if v_unidade is null or v_unidade not between 1 and 5 then
      v_unidade := null;
    end if;
  exception when others then
    v_unidade := null;
  end;

  begin
    v_marketing := coalesce((new.raw_user_meta_data ->> 'marketing_opt_in')::boolean, false);
  exception when others then
    v_marketing := false;
  end;

  begin
    v_termos := (new.raw_user_meta_data ->> 'terms_accepted_at')::timestamptz;
  exception when others then
    v_termos := now();
  end;

  insert into public.profiles (
    id, full_name, phone, preferred_unit, role, marketing_opt_in, terms_accepted_at
  )
  values (
    new.id, v_nome, v_telefone, v_unidade, 'aluno', v_marketing, coalesce(v_termos, now())
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. updated_at automático
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Função de papel
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ----------------------------------------------------------------------------
-- 5. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- SELECT: o aluno lê a própria linha.
drop policy if exists "aluno le o proprio perfil" on public.profiles;
create policy "aluno le o proprio perfil"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- SELECT: admin lê todas — mas só com segundo fator confirmado (AAL2).
drop policy if exists "admin le todos os perfis" on public.profiles;
create policy "admin le todos os perfis"
  on public.profiles for select
  to authenticated
  using (
    (select public.is_admin())
    and (select auth.jwt() ->> 'aal') = 'aal2'
  );

-- UPDATE: o aluno altera apenas a própria linha.
drop policy if exists "aluno atualiza o proprio perfil" on public.profiles;
create policy "aluno atualiza o proprio perfil"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- INSERT e DELETE: nenhuma policy para clientes.
-- O insert é feito pela trigger; o delete, pela Edge Function com service_role.
drop policy if exists "sem insert pelo cliente" on public.profiles;
drop policy if exists "sem delete pelo cliente" on public.profiles;

-- ----------------------------------------------------------------------------
-- 6. Proteção do campo role no nível de privilégio
--    Mesmo com a policy de update, o aluno só consegue gravar estas colunas.
-- ----------------------------------------------------------------------------
revoke all on table public.profiles from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (full_name, phone, preferred_unit, goal, marketing_opt_in)
  on table public.profiles to authenticated;

-- anon não tem acesso nenhum à tabela.

-- ----------------------------------------------------------------------------
-- 7. Para tornar alguém admin (rodar manualmente no SQL Editor):
--
--   update public.profiles
--   set role = 'admin'
--   where id = (select id from auth.users where email = 'EMAIL_AQUI');
-- ----------------------------------------------------------------------------
