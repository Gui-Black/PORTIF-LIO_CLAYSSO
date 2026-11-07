begin;

-- Retorna somente a autorização da própria sessão, sem expor a lista de contas.
create function public.current_user_is_administrator()
returns boolean
language sql stable security invoker
set search_path = ''
as $$ select private.is_administrator(); $$;

revoke all on function public.current_user_is_administrator() from public, anon;
grant execute on function public.current_user_is_administrator() to authenticated;

commit;
