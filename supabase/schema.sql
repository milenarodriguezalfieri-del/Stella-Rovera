-- =========================================================
-- Nutrir(se) — Esquema de base de datos
-- Panel de la nutricionista Stella Rovera
-- =========================================================
-- Cómo usar este archivo:
-- 1. Entrá a tu proyecto en https://supabase.com
-- 2. Menú lateral izquierdo → "SQL Editor"
-- 3. Pegá todo este archivo y hacé clic en "Run"
--
-- Si ya habías corrido una versión anterior de este esquema
-- (con una tabla "form_responses"), este script la reemplaza
-- por la nueva estructura de 3 etapas x 7 días.
-- =========================================================

create extension if not exists "pgcrypto";

drop table if exists form_responses cascade;

-- ---------------------------------------------------------
-- Tabla de pacientes
-- ---------------------------------------------------------
create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  notes text,
  created_at timestamptz not null default now(),
  tracking_type text not null default 'alimentos_habitos'
    check (tracking_type in ('alimentos', 'alimentos_habitos'))
);

-- Si la tabla ya existía de una versión anterior de este esquema,
-- esto agrega la columna sin romper nada:
alter table patients add column if not exists tracking_type text
  not null default 'alimentos_habitos';
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'patients_tracking_type_check'
  ) then
    alter table patients add constraint patients_tracking_type_check
      check (tracking_type in ('alimentos', 'alimentos_habitos'));
  end if;
end $$;

-- ---------------------------------------------------------
-- Tabla del diario: 3 etapas ("stage" 1-3), 7 días cada una
-- ("day" 1-7 dentro de cada etapa)
-- ---------------------------------------------------------
create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  stage smallint not null check (stage between 1 and 3),
  day smallint not null check (day between 1 and 7),
  answer text not null default '',
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  unique (patient_id, stage, day)
);

-- ---------------------------------------------------------
-- Seguridad: Row Level Security
-- ---------------------------------------------------------
alter table patients enable row level security;
alter table diary_entries enable row level security;

-- La nutricionista (usuario logueado en el panel) tiene acceso total
drop policy if exists "authenticated_full_access_patients" on patients;
create policy "authenticated_full_access_patients" on patients
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated_full_access_entries" on diary_entries;
create policy "authenticated_full_access_entries" on diary_entries
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Cualquier persona con el link (sin login) puede escribir sus propias
-- entradas del diario, pero no puede leer la tabla directamente
-- (la lectura se hace a través de la función get_patient_entries)
drop policy if exists "anon_insert_entries" on diary_entries;
create policy "anon_insert_entries" on diary_entries
  for insert
  to anon
  with check (true);

drop policy if exists "anon_update_entries" on diary_entries;
create policy "anon_update_entries" on diary_entries
  for update
  to anon
  using (true)
  with check (true);

-- ---------------------------------------------------------
-- Función segura: buscar paciente por código de link
-- (Devuelve solo id y nombre, nunca la lista completa de pacientes)
-- ---------------------------------------------------------
create or replace function get_patient_by_code(p_code text)
returns table (id uuid, name text, tracking_type text)
language sql
security definer
set search_path = public
as $$
  select id, name, tracking_type from patients where code = p_code;
$$;

grant execute on function get_patient_by_code(text) to anon;

-- ---------------------------------------------------------
-- Función segura: traer las entradas del diario de una paciente
-- por su código de link (sin exponer la tabla completa)
-- ---------------------------------------------------------
create or replace function get_patient_entries(p_code text)
returns table (stage smallint, day smallint, answer text, answered_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select e.stage, e.day, e.answer, e.answered_at
  from diary_entries e
  join patients p on p.id = e.patient_id
  where p.code = p_code;
$$;

grant execute on function get_patient_entries(text) to anon;
