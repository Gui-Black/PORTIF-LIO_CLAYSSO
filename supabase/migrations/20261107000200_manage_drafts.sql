begin;

create function public.create_work_draft(p_work_id uuid, p_version_id uuid, p_slug text, p_title text, p_category_id uuid, p_description text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare actual_slug text;
begin
  if not private.is_administrator() then raise exception 'Acesso restrito.' using errcode = '42501'; end if;
  if length(btrim(p_title)) = 0 then raise exception 'Preencha o título.' using errcode = '23514'; end if;
  insert into public.works(id,slug) values(p_work_id,p_slug) on conflict(id) do nothing;
  select slug into actual_slug from public.works where id=p_work_id for update;
  if actual_slug is distinct from p_slug then raise exception 'Identidade já utilizada.' using errcode='23514'; end if;
  if exists(select 1 from public.work_versions where id=p_version_id and work_id=p_work_id) then return p_version_id; end if;
  insert into public.work_versions(id,work_id,category_id,title,description)
    values(p_version_id,p_work_id,p_category_id,btrim(p_title),p_description);
  return p_version_id;
end; $$;

create function public.save_work_draft(p_version_id uuid, p_expected_revision bigint, p_title text, p_category_id uuid, p_description text, p_cover_photo_id uuid)
returns bigint language plpgsql security definer set search_path = '' as $$
declare candidate public.work_versions%rowtype; result bigint;
begin
  if not private.is_administrator() then raise exception 'Acesso restrito.' using errcode='42501'; end if;
  select * into candidate from public.work_versions where id=p_version_id for update;
  if not found or candidate.sealed_at is not null then raise exception 'Rascunho indisponível.' using errcode='23514'; end if;
  if candidate.revision is distinct from p_expected_revision then raise exception 'Rascunho alterado; recarregue.' using errcode='40001'; end if;
  if length(btrim(p_title)) = 0 then raise exception 'Preencha o título.' using errcode='23514'; end if;
  update public.work_versions set title=btrim(p_title), category_id=p_category_id,
    description=p_description, cover_photo_id=p_cover_photo_id where id=p_version_id returning revision into result;
  return result;
end; $$;

create function public.attach_work_photo(p_version_id uuid, p_expected_revision bigint, p_photo_id uuid, p_path text, p_alt text, p_width integer, p_height integer)
returns bigint language plpgsql security definer set search_path = '' as $$
declare candidate public.work_versions%rowtype; existing public.photos%rowtype; next_order integer; result bigint;
begin
  if not private.is_administrator() then raise exception 'Acesso restrito.' using errcode='42501'; end if;
  select * into candidate from public.work_versions where id=p_version_id for update;
  if not found or candidate.sealed_at is not null then raise exception 'Rascunho indisponível.' using errcode='23514'; end if;
  select * into existing from public.photos where id=p_photo_id;
  if found then
    if existing.version_id=p_version_id and existing.storage_path=p_path and existing.alt_text=p_alt and existing.width=p_width and existing.height=p_height then return candidate.revision; end if;
    raise exception 'Fotografia já utilizada.' using errcode='23514';
  end if;
  if candidate.revision is distinct from p_expected_revision then raise exception 'Rascunho alterado; recarregue.' using errcode='40001'; end if;
  if split_part(p_path,'/',1) <> p_version_id::text then raise exception 'Caminho inválido.' using errcode='23514'; end if;
  if not exists(select 1 from storage.objects where bucket_id='portfolio' and name=p_path
    and metadata->>'mimetype' in ('image/jpeg','image/png','image/webp')
    and coalesce((metadata->>'size')::bigint,0) between 1 and 10485760) then
    raise exception 'Arquivo não confirmado no Storage.' using errcode='23514';
  end if;
  select coalesce(max(sort_order),-1)+1 into next_order from public.photos where version_id=p_version_id;
  insert into public.photos(id,version_id,storage_path,alt_text,width,height,upload_state,sort_order)
    values(p_photo_id,p_version_id,p_path,p_alt,p_width,p_height,'ready',next_order);
  select revision into result from public.work_versions where id=p_version_id;
  return result;
end; $$;

revoke all on function public.create_work_draft(uuid,uuid,text,text,uuid,text), public.save_work_draft(uuid,bigint,text,uuid,text,uuid), public.attach_work_photo(uuid,bigint,uuid,text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.create_work_draft(uuid,uuid,text,text,uuid,text), public.save_work_draft(uuid,bigint,text,uuid,text,uuid), public.attach_work_photo(uuid,bigint,uuid,text,text,integer,integer) to authenticated;
commit;
