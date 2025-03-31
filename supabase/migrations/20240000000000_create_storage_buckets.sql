-- Create the storage bucket
insert into storage.buckets (id, name, public)
values ('uzzap', 'uzzap', true);

-- Allow authenticated users to upload files to the bucket
create policy "Authenticated users can upload files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'uzzap' AND
  (storage.foldername(name))[1] in ('avatars', 'covers')
);

-- Allow authenticated users to update their own files
create policy "Users can update their own files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'uzzap' AND
  auth.uid()::text = (storage.foldername(name))[2]
)
with check (
  bucket_id = 'uzzap' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow public access to read files
create policy "Public read access"
on storage.objects
for select
to public
using (bucket_id = 'uzzap');
