-- Run this whole file once in Supabase > SQL Editor
do $$
declare t text;
begin
  foreach t in array array['products','orders','users','reviews','messages','coupons','settings','admins'] loop
    execute format('create table if not exists public.%I (id text primary key, data jsonb not null default ''{}''::jsonb, updated_at timestamptz not null default now())', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select, insert, update, delete on public.%I to anon, authenticated', t);
    begin execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null; end;
  end loop;
end $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admins where id = auth.uid()::text and data->>'role' = 'admin')
$$;

create or replace function public.apply_ops(ops jsonb) returns void
language plpgsql security invoker set search_path = public as $$
declare o jsonb; t text; i text; d jsonb; k text; v jsonb; p text[]; cur jsonb;
begin
  for o in select * from jsonb_array_elements(ops) loop
    t := o->>'col'; i := o->>'id'; d := coalesce(o->'data','{}'::jsonb);
    if t not in ('products','orders','users','reviews','messages','coupons','settings') then
      raise exception 'invalid collection %', t; end if;
    if o->>'op' = 'set' then
      execute format('insert into public.%I(id,data,updated_at) values($1,$2,now()) on conflict (id) do update set data=excluded.data, updated_at=now()', t) using i, d;
    elsif o->>'op' = 'update' then
      execute format('select data from public.%I where id=$1 for update', t) into cur using i;
      if cur is null then raise exception 'document % not found in %', i, t using errcode = 'P0002'; end if;
      for k, v in select * from jsonb_each(d) loop
        p := string_to_array(k, '.');
        if jsonb_typeof(v) = 'object' and v ? '__inc' then
          v := to_jsonb(coalesce((cur #>> p)::numeric, 0) + (v->>'__inc')::numeric);
        end if;
        cur := jsonb_set(cur, p, v, true);
      end loop;
      execute format('update public.%I set data=$2, updated_at=now() where id=$1', t) using i, cur;
    elsif o->>'op' = 'delete' then
      execute format('delete from public.%I where id=$1', t) using i;
    end if;
  end loop;
end $$;

create or replace function public.guard_products() returns trigger
language plpgsql security invoker set search_path = public as $$
begin
  if not public.is_admin() then
    if (new.data - 'stock' - 'rating' - 'reviews') is distinct from (old.data - 'stock' - 'rating' - 'reviews') then
      raise exception 'permission denied: only admin can edit products'; end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_guard_products on public.products;
create trigger trg_guard_products before update on public.products for each row execute function public.guard_products();

do $$
declare t text; pol record;
begin
  foreach t in array array['products','orders','users','reviews','messages','coupons','settings','admins'] loop
    for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
  end loop;
end $$;

create policy p_sel on public.products for select using (true);
create policy p_ins on public.products for insert with check (public.is_admin());
create policy p_upd on public.products for update using (true) with check (true);
create policy p_del on public.products for delete using (public.is_admin());

create policy p_sel on public.settings for select using (true);
create policy p_ins on public.settings for insert with check (public.is_admin());
create policy p_upd on public.settings for update using (public.is_admin()) with check (public.is_admin());
create policy p_del on public.settings for delete using (public.is_admin());

create policy p_sel on public.coupons for select using (true);
create policy p_ins on public.coupons for insert with check (public.is_admin());
create policy p_upd on public.coupons for update using (public.is_admin()) with check (public.is_admin());
create policy p_del on public.coupons for delete using (public.is_admin());

create policy p_sel on public.reviews for select using (true);
create policy p_ins on public.reviews for insert with check (true);
create policy p_upd on public.reviews for update using (true) with check (true);
create policy p_del on public.reviews for delete using (public.is_admin());

create policy p_sel on public.orders for select using (true);
create policy p_ins on public.orders for insert with check (true);
create policy p_upd on public.orders for update using (true) with check (true);
create policy p_del on public.orders for delete using (public.is_admin());

create policy p_sel on public.users for select using (true);
create policy p_ins on public.users for insert with check (true);
create policy p_upd on public.users for update using (true) with check (true);
create policy p_del on public.users for delete using (public.is_admin());

create policy p_ins on public.messages for insert with check (true);
create policy p_sel on public.messages for select using (public.is_admin());
create policy p_upd on public.messages for update using (public.is_admin()) with check (public.is_admin());
create policy p_del on public.messages for delete using (public.is_admin());

create policy p_sel on public.admins for select using (id = auth.uid()::text);

-- ADMIN: create a user in Authentication > Users, then run with that user's UUID:
-- insert into public.admins(id,data) values ('USER_UUID_HERE','{"role":"admin"}');
