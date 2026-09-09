-- Applied after foundation.sql.
-- Ownership comes from the verified Clerk JWT instead of browser-provided values.

alter table public.assignments
  alter column teacher_id set default (auth.jwt() ->> 'sub');

alter table public.class_members
  alter column teacher_id set default (auth.jwt() ->> 'sub');
