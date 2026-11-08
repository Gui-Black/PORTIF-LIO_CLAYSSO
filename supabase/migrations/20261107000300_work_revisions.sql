begin;

-- Remoção reversível. Os bytes continuam protegidos no Storage.
alter table public.photos add column removed_at timestamptz;

create or replace function private.is_visible_photo(photo_id uuid, version_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.photos p where p.id=$1 and p.version_id=$2 and p.removed_at is null)
    and (private.is_published_version(version_id) or exists (
      select 1 from public.site_settings s where photo_id in (s.hero_photo_id,s.portrait_photo_id)
    ));
$$;

create function private.guard_active_cover() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.cover_photo_id is not null and exists (
    select 1 from public.photos where id=new.cover_photo_id and removed_at is not null
  ) then raise exception 'Escolha uma foto que esteja na seleção.' using errcode='23514'; end if;
  return new;
end; $$;
create trigger guard_active_cover before insert or update on public.work_versions
for each row execute function private.guard_active_cover();
revoke all on function private.guard_active_cover() from public,anon,authenticated;

create function public.begin_work_revision(p_work_id uuid,p_source_version_id uuid,p_new_version_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare source public.work_versions%rowtype; current_id uuid; draft_id uuid; new_cover uuid;
begin
  if not private.is_administrator() then raise exception 'Acesso restrito.' using errcode='42501'; end if;
  -- Mesma ordem de bloqueios usada na publicação: versão, depois trabalho.
  select * into source from public.work_versions where id=p_source_version_id and work_id=p_work_id for update;
  if not found or source.sealed_at is null then raise exception 'Versão publicada não encontrada.' using errcode='23514'; end if;
  select published_version_id into current_id from public.works where id=p_work_id for update;
  if exists(select 1 from public.work_versions where id=p_new_version_id and work_id=p_work_id and id<>p_source_version_id) then return p_new_version_id; end if;
  select id into draft_id from public.work_versions where work_id=p_work_id and sealed_at is null;
  if found then return draft_id; end if;
  if current_id is not null and current_id<>p_source_version_id then raise exception 'A publicação mudou. Recarregue a lista.' using errcode='40001'; end if;
  insert into public.work_versions(id,work_id,category_id,title,description)
    values(p_new_version_id,p_work_id,source.category_id,source.title,source.description);
  insert into public.photos(id,version_id,storage_path,alt_text,width,height,upload_state,sort_order,focal_x,focal_y)
    select gen_random_uuid(),p_new_version_id,storage_path,alt_text,width,height,upload_state,sort_order,focal_x,focal_y
    from public.photos where version_id=p_source_version_id and removed_at is null;
  select copied.id into new_cover from public.photos original join public.photos copied on copied.storage_path=original.storage_path
    where original.id=source.cover_photo_id and copied.version_id=p_new_version_id;
  update public.work_versions set cover_photo_id=new_cover where id=p_new_version_id;
  return p_new_version_id;
end; $$;

create function public.set_draft_photo_removed(p_version_id uuid,p_expected_revision bigint,p_photo_id uuid,p_removed boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare candidate public.work_versions%rowtype; photo public.photos%rowtype;
begin
  if not private.is_administrator() then raise exception 'Acesso restrito.' using errcode='42501'; end if;
  if p_removed is null then raise exception 'Informe a ação.' using errcode='22023'; end if;
  select * into candidate from public.work_versions where id=p_version_id for update;
  if not found or candidate.sealed_at is not null then raise exception 'Rascunho indisponível.' using errcode='23514'; end if;
  select * into photo from public.photos where id=p_photo_id and version_id=p_version_id;
  if not found then raise exception 'Fotografia não encontrada.' using errcode='22023'; end if;
  if (photo.removed_at is not null)=p_removed then return; end if;
  if candidate.revision is distinct from p_expected_revision then raise exception 'Recarregue o rascunho.' using errcode='40001'; end if;
  if p_removed and candidate.cover_photo_id=p_photo_id then
    update public.work_versions set cover_photo_id=null where id=p_version_id;
  end if;
  update public.photos set removed_at=case when p_removed then now() else null end where id=p_photo_id;
end; $$;

create function public.reorder_draft_photos(p_version_id uuid,p_expected_revision bigint,p_photo_ids uuid[])
returns void language plpgsql security definer set search_path = '' as $$
declare candidate public.work_versions%rowtype; total integer;
begin
  if not private.is_administrator() then raise exception 'Acesso restrito.' using errcode='42501'; end if;
  select * into candidate from public.work_versions where id=p_version_id for update;
  if not found or candidate.sealed_at is not null then raise exception 'Rascunho indisponível.' using errcode='23514'; end if;
  if candidate.revision is distinct from p_expected_revision then raise exception 'Recarregue o rascunho.' using errcode='40001'; end if;
  select count(*) into total from public.photos where version_id=p_version_id and removed_at is null;
  if p_photo_ids is null or cardinality(p_photo_ids)<>total or
    (select count(distinct id) from unnest(p_photo_ids) id)<>total or exists(
      select 1 from unnest(p_photo_ids) as requested(photo_id) where not exists(
        select 1 from public.photos p where p.id=requested.photo_id and p.version_id=p_version_id and p.removed_at is null
      )
    ) then raise exception 'A ordem precisa conter todas as fotos da seleção, sem repetições.' using errcode='22023'; end if;
  set constraints public.photo_order_unique deferred;
  update public.photos p set sort_order=ordered.position-1
    from (select id,ordinality::integer position from unnest(p_photo_ids) with ordinality as items(id,ordinality)) ordered
    where p.id=ordered.id and p.version_id=p_version_id;
  with removed as (
    select id,row_number() over(order by sort_order,id)::integer position from public.photos where version_id=p_version_id and removed_at is not null
  ) update public.photos p set sort_order=total+removed.position-1 from removed where p.id=removed.id;
  set constraints public.photo_order_unique immediate;
end; $$;

revoke all on function public.begin_work_revision(uuid,uuid,uuid),public.set_draft_photo_removed(uuid,bigint,uuid,boolean),public.reorder_draft_photos(uuid,bigint,uuid[]) from public,anon,authenticated;
grant execute on function public.begin_work_revision(uuid,uuid,uuid),public.set_draft_photo_removed(uuid,bigint,uuid,boolean),public.reorder_draft_photos(uuid,bigint,uuid[]) to authenticated;

create or replace function public.publish_work(p_work_id uuid, p_version_id uuid, p_expected_revision bigint)
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
  if not exists (select 1 from public.photos where version_id = p_version_id and removed_at is null) or exists (
    select 1 from public.photos where version_id = p_version_id and removed_at is null and upload_state <> 'ready'
  ) then
    raise exception 'Todas as fotografias precisam estar prontas.' using errcode = '23514';
  end if;
  if exists (
    select 1 from public.photos p where p.version_id = p_version_id and p.removed_at is null and not exists (
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


commit;
