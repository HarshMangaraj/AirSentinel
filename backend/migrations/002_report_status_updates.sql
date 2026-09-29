-- ──────────────────────────────────────────────────────────────────
-- Migration 002: Report Status Updates (Real-time tracking + alerts)
-- Run this in Supabase SQL Editor
-- ──────────────────────────────────────────────────────────────────

-- Table that the gov dashboard writes to whenever a report status changes.
-- The mobile app subscribes to this via Supabase Realtime.
create table if not exists public.report_status_updates (
  id             uuid primary key default gen_random_uuid(),
  report_id      text not null,
  old_status     text,
  new_status     text not null,
  assigned_to    text,
  admin_notes    text,
  updated_by     text,
  created_at     timestamptz default now()
);

create index if not exists idx_rsu_report_id on public.report_status_updates(report_id);
create index if not exists idx_rsu_created_at on public.report_status_updates(created_at desc);

alter table public.report_status_updates enable row level security;

create policy "Anyone can view report status updates"
  on public.report_status_updates for select
  using ( auth.role() = 'authenticated' );

create policy "Service role can insert status updates"
  on public.report_status_updates for insert
  with check ( true );

grant select on public.report_status_updates to authenticated;
grant insert on public.report_status_updates to authenticated;

-- Enable Realtime for this table
alter publication supabase_realtime add table public.report_status_updates;
