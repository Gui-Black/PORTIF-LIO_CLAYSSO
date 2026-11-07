begin;

-- Os bytes são enviados pela API Storage, nunca por INSERT em storage.objects.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']);

create function private.can_read_portfolio_object(object_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_administrator() or exists (
    select 1 from public.photos p where p.storage_path = object_name
      and p.upload_state = 'ready' and private.is_visible_photo(p.id, p.version_id)
  );
$$;
revoke all on function private.can_read_portfolio_object(text) from public, anon, authenticated;
grant execute on function private.can_read_portfolio_object(text) to anon, authenticated;

create policy portfolio_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'portfolio' and private.can_read_portfolio_object(name));
create policy portfolio_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and (select private.is_administrator())
    and name ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$');

-- Cercas restritivas também se aplicam se outra política permissiva for criada.
create policy portfolio_read_boundary on storage.objects as restrictive for select to anon, authenticated
  using (bucket_id <> 'portfolio' or private.can_read_portfolio_object(name));
create policy portfolio_insert_boundary on storage.objects as restrictive for insert to anon, authenticated
  with check (bucket_id <> 'portfolio' or ((select private.is_administrator())
    and name ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$'));
create policy portfolio_no_overwrite on storage.objects as restrictive for update to anon, authenticated
  using (bucket_id <> 'portfolio') with check (bucket_id <> 'portfolio');
create policy portfolio_no_delete on storage.objects as restrictive for delete to anon, authenticated
  using (bucket_id <> 'portfolio');

create function public.publish_work(p_work_id uuid, p_version_id uuid, p_expected_revision bigint)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  candidate public.work_versions%rowtype;
  current_publication uuid;
begin
  if not private.is_administrator() then
    raise exception 'Acesso restrito à administração.' using errcode = '42501';
  end if;

  -- Fotos e metadados usam o mesmo bloqueio da versão.
  select * into candidate from public.work_versions
    where id = p_version_id and work_id = p_work_id for update;
  if not found then raise exception 'Versão não encontrada para este trabalho.' using errcode = '22023'; end if;
  select published_version_id into current_publication from public.works where id = p_work_id for update;

  -- Repetir uma solicitação concluída não cria outra versão nem altera revisão.
  if current_publication = p_version_id and candidate.sealed_at is not null then return p_version_id; end if;
  if candidate.sealed_at is not null then
    raise exception 'Publique um novo rascunho, não uma versão arquivada.' using errcode = '23514';
  end if;
  if candidate.revision is distinct from p_expected_revision then
    raise exception 'O rascunho mudou; recarregue antes de publicar.' using errcode = '40001';
  end if;
  if length(btrim(candidate.title)) = 0 or candidate.cover_photo_id is null then
    raise exception 'Preencha o título e escolha uma capa.' using errcode = '23514';
  end if;
  if not exists (select 1 from public.photos where version_id = p_version_id) or exists (
    select 1 from public.photos where version_id = p_version_id and upload_state <> 'ready'
  ) then
    raise exception 'Todas as fotografias precisam estar prontas.' using errcode = '23514';
  end if;
  if exists (
    select 1 from public.photos p where p.version_id = p_version_id and not exists (
      select 1 from storage.objects o where o.bucket_id = 'portfolio' and o.name = p.storage_path
        and o.metadata ->> 'mimetype' in ('image/jpeg', 'image/png', 'image/webp')
        and coalesce((o.metadata ->> 'size')::bigint, 0) between 1 and 10485760
    )
  ) then
    raise exception 'Há arquivos ausentes ou inválidos no Storage.' using errcode = '23514';
  end if;

  update public.work_versions set sealed_at = now() where id = p_version_id;
  update public.works set published_version_id = p_version_id where id = p_work_id;
  return p_version_id;
end;
$$;

create function public.unpublish_work(p_work_id uuid, p_expected_version_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare current_publication uuid;
begin
  if not private.is_administrator() then
    raise exception 'Acesso restrito à administração.' using errcode = '42501';
  end if;
  select published_version_id into current_publication from public.works where id = p_work_id for update;
  if not found then raise exception 'Trabalho não encontrado.' using errcode = '22023'; end if;
  if current_publication is null then return; end if;
  if current_publication is distinct from p_expected_version_id then
    raise exception 'A publicação mudou; recarregue antes de retirar.' using errcode = '40001';
  end if;
  update public.works set published_version_id = null where id = p_work_id;
end;
$$;

revoke all on function public.publish_work(uuid, uuid, bigint), public.unpublish_work(uuid, uuid) from public, anon, authenticated;
grant execute on function public.publish_work(uuid, uuid, bigint), public.unpublish_work(uuid, uuid) to authenticated;

comment on column public.work_versions.sealed_at is 'Versão validada e imutável. A visibilidade depende de works.published_version_id.';
comment on column public.work_versions.revision is 'Incrementada por alterações de metadados ou fotos; usada para detectar publicação desatualizada.';
comment on table private.administrators is 'Provisionamento exclusivo por operador confiável. Sem autoinscrição e sem acesso pela API pública.';
comment on table public.site_settings is 'Somente conteúdo público. Fotos referenciadas aqui continuam visíveis mesmo após retirar o trabalho da galeria.';

commit;
