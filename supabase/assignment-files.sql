insert into storage.buckets (id, name, public, file_size_limit)
values ('assignment-files', 'assignment-files', false, 20971520)
on conflict (id) do update set public=false, file_size_limit=20971520;

drop policy if exists teachers_manage_assignment_files on storage.objects;
create policy teachers_manage_assignment_files
on storage.objects for all to authenticated
using (
  bucket_id='assignment-files'
  and (select auth.jwt() -> 'metadata' ->> 'role')='teacher'
  and (storage.foldername(name))[1]=(select auth.jwt() ->> 'sub')
)
with check (
  bucket_id='assignment-files'
  and (select auth.jwt() -> 'metadata' ->> 'role')='teacher'
  and (storage.foldername(name))[1]=(select auth.jwt() ->> 'sub')
);

drop policy if exists students_read_assignment_files on storage.objects;
create policy students_read_assignment_files
on storage.objects for select to authenticated
using (
  bucket_id='assignment-files'
  and (select auth.jwt() -> 'metadata' ->> 'role')='student'
  and (storage.foldername(name))[2] ~ '^[0-9]+$'
  and exists (
    select 1 from public.assignments a
    join public.class_members cm on cm.class_id=a.class_id
    where a.id=((storage.foldername(name))[2])::bigint
      and cm.student_id=(select auth.jwt() ->> 'sub')
  )
);

drop policy if exists teachers_delete_submission_files on storage.objects;
create policy teachers_delete_submission_files
on storage.objects for delete to authenticated
using (
  bucket_id='submissions'
  and (select auth.jwt() -> 'metadata' ->> 'role')='teacher'
  and (storage.foldername(name))[2] ~ '^[0-9]+$'
  and exists (
    select 1 from public.assignments a
    where a.id=((storage.foldername(name))[2])::bigint
      and a.teacher_id=(select auth.jwt() ->> 'sub')
  )
);
