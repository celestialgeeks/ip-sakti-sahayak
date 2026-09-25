-- Registration & Compliance Wizard — per-user progress
-- Run this in the Supabase SQL editor (or via the CLI) to enable /api/wizard/state.

create table if not exists public.wizard_states (
    user_id       uuid primary key references auth.users (id) on delete cascade,
    current_step  text        not null default 'eligibility',
    product_type  text,
    classification jsonb,
    steps         jsonb       not null default '[]'::jsonb,
    answers       jsonb,
    updated_at    timestamptz not null default now()
);

-- Keep updated_at fresh on every write.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists wizard_states_touch_updated_at on public.wizard_states;
create trigger wizard_states_touch_updated_at
  before update on public.wizard_states
  for each row execute function public.touch_updated_at();

-- Row Level Security: the backend uses the service-role key (bypasses RLS),
-- but we still lock direct anon access down to a user's own row.
alter table public.wizard_states enable row level security;

drop policy if exists "wizard_states_own_row" on public.wizard_states;
create policy "wizard_states_own_row"
  on public.wizard_states for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
