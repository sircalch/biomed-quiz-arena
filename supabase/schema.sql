create table if not exists public.quiz_sessions (
  id bigserial primary key,
  external_id text not null unique,
  category text not null,
  category_name text not null,
  participant_alias text not null default 'Invitado',
  score integer not null,
  total integer not null,
  correct_count integer not null,
  best_streak integer not null default 0,
  completed_at timestamptz not null default now()
);
