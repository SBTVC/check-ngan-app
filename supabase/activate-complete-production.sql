-- Activate complete production permissions for check-ngan System.
-- Backfill memberships from existing submissions before removing demo policies.

insert into public.class_members(class_id, student_id, teacher_id)
select distinct a.class_id, s.student_id, a.teacher_id
from public.submissions s
join public.assignments a on a.id = s.assignment_id
where a.class_id is not null and s.student_id is not null and a.teacher_id is not null
on conflict (class_id, student_id) do nothing;

create unique index if not exists profiles_student_id_unique
on public.profiles(student_id)
where student_id is not null;

drop policy if exists demo_students_read_assignments on public.assignments;
drop policy if exists demo_students_submit_work on public.submissions;
drop policy if exists teachers_grade_own_submissions on public.submissions;

insert into storage.buckets (id, name, public, file_size_limit)
values ('submissions', 'submissions', false, 20971520)
on conflict (id) do update set public = false, file_size_limit = 20971520;

-- Folder layout: <student_clerk_id>/<assignment_id>/<filename>
drop policy if exists students_upload_submission_files on storage.objects;
create policy students_upload_submission_files
on storage.objects for insert to authenticated
with check (
  bucket_id = 'submissions'
  and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  and (storage.foldername(name))[2] ~ '^[0-9]+$'
  and exists (
    select 1 from public.assignments a
    join public.class_members cm on cm.class_id = a.class_id
    where a.id = ((storage.foldername(name))[2])::bigint
      and cm.student_id = (select auth.jwt() ->> 'sub')
  )
);

drop policy if exists students_read_own_submission_files on storage.objects;
create policy students_read_own_submission_files
on storage.objects for select to authenticated
using (
  bucket_id = 'submissions'
  and (select auth.jwt() -> 'metadata' ->> 'role') = 'student'
  and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
);

drop policy if exists students_delete_own_submission_files on storage.objects;
create policy students_delete_own_submission_files
on storage.objects for delete to authenticated
using (
  bucket_id = 'submissions'
  and (select auth.jwt() -> 'metadata' ->> 'role') = 'student'
  and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
);

drop policy if exists teachers_read_submission_files on storage.objects;
create policy teachers_read_submission_files
on storage.objects for select to authenticated
using (
  bucket_id = 'submissions'
  and (select auth.jwt() -> 'metadata' ->> 'role') = 'teacher'
  and (storage.foldername(name))[2] ~ '^[0-9]+$'
  and exists (
    select 1 from public.assignments a
    where a.id = ((storage.foldername(name))[2])::bigint
      and a.teacher_id = (select auth.jwt() ->> 'sub')
  )
);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'submissions'
  ) then
    alter publication supabase_realtime add table public.submissions;
  end if;
end
$$;
