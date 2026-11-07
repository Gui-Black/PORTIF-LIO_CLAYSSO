-- Fundação local. Aplicar em projeto Supabase novo, com Auth e Storage instalados.
begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create table private.administrators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table private.administrators enable row level security;
revoke all on private.administrators from public, anon, authenticated;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  name text not null check (length(btrim(name)) between 1 and 80),
  description text not null default '' check (length(description) <= 1000),
  sort_order integer not null default 0 check (sort_order >= 0)
);

create table public.works (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  published_version_id uuid,
  featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create table public.work_versions (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null default '' check (length(title) <= 140),
  description text not null default '' check (length(description) <= 5000),
  cover_photo_id uuid,
  revision bigint not null default 0 check (revision >= 0),
  sealed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (work_id, id)
);
create unique index one_draft_per_work on public.work_versions(work_id) where sealed_at is null;
create index versions_category_idx on public.work_versions(category_id);
create index works_published_version_idx on public.works(published_version_id)
  where published_version_id is not null;

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.work_versions(id) on delete restrict,
  storage_path text not null check (
    storage_path ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$'
  ),
  alt_text text not null default '' check (length(alt_text) <= 500),
  width integer check (width between 1 and 20000),
  height integer check (height between 1 and 20000),
  upload_state text not null default 'pending' check (upload_state in ('pending', 'ready', 'failed')),
  sort_order integer not null check (sort_order >= 0),
  focal_x numeric(5,4) not null default 0.5 check (focal_x between 0 and 1),
  focal_y numeric(5,4) not null default 0.5 check (focal_y between 0 and 1),
  created_at timestamptz not null default now(),
  constraint ready_photo_metadata check (
    upload_state <> 'ready' or (width is not null and height is not null and length(btrim(alt_text)) > 0)
  ),
  unique (version_id, id),
  unique (version_id, storage_path),
  constraint photo_order_unique unique (version_id, sort_order) deferrable initially immediate
);
create index photos_path_idx on public.photos(storage_path);

-- Chaves compostas impedem ligar capa e publicação a outro trabalho/versão.
alter table public.work_versions add constraint version_cover_fk
  foreign key (id, cover_photo_id) references public.photos(version_id, id)
  on delete restrict deferrable initially immediate;
alter table public.works add constraint work_publication_fk
  foreign key (id, published_version_id) references public.work_versions(work_id, id)
  on delete restrict deferrable initially immediate;

create table public.site_settings (
  singleton boolean primary key default true check (singleton),
  brand_name text not null check (length(btrim(brand_name)) between 1 and 100),
  tagline text not null default '' check (length(tagline) <= 200),
  region text not null default '' check (length(region) <= 120),
  instagram_url text check (instagram_url ~ '^https://www\.instagram\.com/[A-Za-z0-9._]+/?$'),
  whatsapp_number text check (whatsapp_number ~ '^[1-9][0-9]{9,14}$'),
  hero_photo_id uuid references public.photos(id) on delete restrict,
  portrait_photo_id uuid references public.photos(id) on delete restrict
);

create function private.is_administrator() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from private.administrators where user_id = (select auth.uid()));
$$;

create function private.is_published_version(version_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.works w where w.published_version_id = version_id);
$$;

create function private.is_visible_photo(photo_id uuid, version_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_published_version(version_id) or exists (
    select 1 from public.site_settings s where photo_id in (s.hero_photo_id, s.portrait_photo_id)
  );
$$;

create function private.guard_version() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.sealed_at is not null then
    raise exception 'Versões seladas são imutáveis; crie um novo rascunho.' using errcode = '23514';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  if new.id <> old.id or new.work_id <> old.work_id then
    raise exception 'A identidade da versão não pode mudar.' using errcode = '23514';
  end if;
  new.revision := old.revision + 1;
  new.updated_at := now();
  return new;
end;
$$;
create trigger guard_version before update or delete on public.work_versions
  for each row execute function private.guard_version();

create function private.guard_photo() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  target_version uuid;
  version_sealed_at timestamptz;
begin
  if tg_op = 'UPDATE' and (new.id <> old.id or new.version_id <> old.version_id) then
    raise exception 'A identidade da fotografia não pode mudar.' using errcode = '23514';
  end if;
  target_version := case when tg_op = 'DELETE' then old.version_id else new.version_id end;
  select sealed_at into version_sealed_at from public.work_versions where id = target_version for update;
  if not found or version_sealed_at is not null then
    raise exception 'Fotografias só podem ser alteradas em rascunhos.' using errcode = '23514';
  end if;
  -- O trigger de versão incrementa a revisão, inclusive quando só fotos mudaram.
  update public.work_versions set updated_at = now() where id = target_version;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
create trigger guard_photo before insert or update or delete on public.photos
  for each row execute function private.guard_photo();

create function private.validate_publication_pointer() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (
    select 1 from public.works w join public.work_versions v on v.id = w.published_version_id
    where w.id = new.id and v.sealed_at is null
  ) then
    raise exception 'A versão publicada precisa estar selada.' using errcode = '23514';
  end if;
  return null;
end;
$$;
create constraint trigger validate_publication_pointer after insert or update on public.works
  deferrable initially deferred for each row execute function private.validate_publication_pointer();

create function private.guard_site_photos() returns trigger
language plpgsql security definer set search_path = '' as $$
declare target_photo uuid;
begin
  foreach target_photo in array array[new.hero_photo_id, new.portrait_photo_id] loop
    if target_photo is not null and not exists (
      select 1 from public.photos p join public.work_versions v on v.id = p.version_id
      where p.id = target_photo and p.upload_state = 'ready' and v.sealed_at is not null
    ) then
      raise exception 'Imagens do site devem pertencer a uma versão validada e selada.' using errcode = '23514';
    end if;
  end loop;
  return new;
end;
$$;
create trigger guard_site_photos before insert or update on public.site_settings
  for each row execute function private.guard_site_photos();

alter table public.categories enable row level security;
alter table public.works enable row level security;
alter table public.work_versions enable row level security;
alter table public.photos enable row level security;
alter table public.site_settings enable row level security;

create policy categories_read on public.categories for select to anon, authenticated using (true);
create policy categories_manage on public.categories for all to authenticated
  using ((select private.is_administrator())) with check ((select private.is_administrator()));
create policy works_read on public.works for select to anon, authenticated
  using (published_version_id is not null or (select private.is_administrator()));
create policy works_manage on public.works for all to authenticated
  using ((select private.is_administrator())) with check ((select private.is_administrator()));
create policy versions_read on public.work_versions for select to anon, authenticated
  using (private.is_published_version(id) or (select private.is_administrator()));
create policy versions_manage on public.work_versions for all to authenticated
  using ((select private.is_administrator())) with check ((select private.is_administrator()));
create policy photos_read on public.photos for select to anon, authenticated
  using ((upload_state = 'ready' and private.is_visible_photo(id, version_id)) or (select private.is_administrator()));
create policy photos_manage on public.photos for all to authenticated
  using ((select private.is_administrator())) with check ((select private.is_administrator()));
create policy settings_read on public.site_settings for select to anon, authenticated using (true);
create policy settings_manage on public.site_settings for all to authenticated
  using ((select private.is_administrator())) with check ((select private.is_administrator()));

-- Remover permissões implícitas antes de conceder somente as colunas editáveis.
revoke all on public.categories, public.works, public.work_versions, public.photos, public.site_settings from public, anon, authenticated;
grant select on public.categories, public.works, public.work_versions, public.photos, public.site_settings to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant insert, update on public.site_settings to authenticated;
grant insert (id, slug, featured, sort_order), update (slug, featured, sort_order), delete on public.works to authenticated;
grant insert (id, work_id, category_id, title, description, cover_photo_id),
  update (category_id, title, description, cover_photo_id), delete on public.work_versions to authenticated;
grant insert (id, version_id, storage_path, alt_text, width, height, upload_state, sort_order, focal_x, focal_y),
  update (storage_path, alt_text, width, height, upload_state, sort_order, focal_x, focal_y), delete on public.photos to authenticated;

revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_administrator(), private.is_published_version(uuid), private.is_visible_photo(uuid, uuid) to anon, authenticated;

commit;
