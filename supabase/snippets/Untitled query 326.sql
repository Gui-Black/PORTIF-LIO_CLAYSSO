insert into private.administrators (user_id)
values ('574616bf-1d2a-4995-aa9a-8a48bc28e099'::uuid)
on conflict (user_id) do nothing;

