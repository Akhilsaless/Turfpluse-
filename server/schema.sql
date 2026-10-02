-- Run once on a dedicated PostgreSQL database using a migration/owner account.
-- DATABASE_URL must use a backend-only role with SELECT/INSERT/UPDATE on turf_meetings,
-- SELECT/INSERT on turf_audit and turf_snapshots. Never expose it to the client.
create table if not exists turf_meetings(id text primary key, document jsonb not null);
create table if not exists turf_audit(id text primary key, meeting_id text not null, document jsonb not null);
create table if not exists turf_snapshots(id text primary key, meeting_id text not null, document jsonb not null);
alter table turf_meetings enable row level security;
alter table turf_audit enable row level security;
alter table turf_snapshots enable row level security;
create table if not exists turf_rate_limits(
  key text primary key, count integer not null,
  expires_at timestamptz not null
);
alter table turf_rate_limits enable row level security;
revoke all on turf_meetings, turf_audit, turf_snapshots, turf_rate_limits from anon, authenticated;
-- No anon/authenticated policies: browser clients access the authenticated server API only.
create or replace function turf_immutable() returns trigger language plpgsql as $$
begin raise exception 'Historical records are immutable'; end; $$;
drop trigger if exists turf_audit_immutable on turf_audit;
create trigger turf_audit_immutable before update or delete on turf_audit for each row execute function turf_immutable();
drop trigger if exists turf_snapshots_immutable on turf_snapshots;
create trigger turf_snapshots_immutable before update or delete on turf_snapshots for each row execute function turf_immutable();
