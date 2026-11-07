-- Somente dados demonstrativos. Nenhuma conta, credencial ou foto real.
insert into public.categories (id, slug, name, sort_order) values
  ('10000000-0000-4000-8000-000000000001', 'ensaios', 'Ensaios', 0),
  ('10000000-0000-4000-8000-000000000002', 'casamentos', 'Casamentos', 1),
  ('10000000-0000-4000-8000-000000000003', 'aniversarios', 'Aniversários', 2),
  ('10000000-0000-4000-8000-000000000004', 'eventos', 'Eventos', 3),
  ('10000000-0000-4000-8000-000000000005', 'produtos', 'Produtos', 4)
on conflict (id) do nothing;

insert into public.site_settings (brand_name, tagline, region)
values ('Estúdio de demonstração', 'Conteúdo fictício para desenvolvimento local', 'Cidade de exemplo')
on conflict (singleton) do nothing;

insert into public.works (id, slug) values
  ('20000000-0000-4000-8000-000000000001', 'ensaio-demonstrativo')
on conflict (id) do nothing;

insert into public.work_versions (id, work_id, category_id, title, description) values (
  '30000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'Ensaio demonstrativo',
  'Rascunho fictício, sem fotografias e sem publicação.'
) on conflict (id) do nothing;
