-- ANH MINH STORE — generic campaign collection (local migration draft only).
-- Apply through the project's reviewed Supabase migration workflow; this file does not alter production by itself.

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaigns_key_format check (key ~ '^[a-z0-9_]+$')
);

create table if not exists public.campaign_items (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaign_items_unique_product unique (campaign_id, product_id)
);

-- One homepage row is the single source of truth for the only featured Box slot.
create table if not exists public.storefront_settings (
  id text primary key check (id = 'homepage'),
  active_featured_box_key text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaign_items_campaign_visible_order_idx
  on public.campaign_items (campaign_id, is_active, sort_order);
create index if not exists campaign_items_product_id_idx
  on public.campaign_items (product_id);

-- One transactional append point for admin bulk-add. SECURITY INVOKER keeps the
-- caller subject to the table RLS policies; the advisory lock prevents two
-- admin requests from calculating the same next sort_order concurrently.
create or replace function public.append_campaign_items(
  p_campaign_id uuid,
  p_product_ids text[]
)
returns table (product_id text, sort_order integer)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_start_order integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_campaign_id::text, 0));
  select coalesce(max(ci.sort_order), 0)
    into v_start_order
    from public.campaign_items ci
   where ci.campaign_id = p_campaign_id;

  return query
  with requested as (
    select distinct on (product_id) product_id, ordinality::integer as ordinal
    from unnest(p_product_ids) with ordinality as t(product_id, ordinality)
    order by product_id, ordinality
  ), normalized as (
    select product_id, row_number() over (order by ordinal)::integer as ordinal
    from requested
  ), inserted as (
    insert into public.campaign_items (campaign_id, product_id, sort_order, is_active)
    select p_campaign_id, normalized.product_id, v_start_order + normalized.ordinal, true
      from normalized
    on conflict (campaign_id, product_id) do update
      set is_active = true,
          updated_at = now()
    returning campaign_items.product_id, campaign_items.sort_order
  )
  select inserted.product_id, inserted.sort_order from inserted order by inserted.sort_order;
end;
$$;

alter table public.campaigns enable row level security;
alter table public.campaign_items enable row level security;
alter table public.storefront_settings enable row level security;

revoke all on table public.campaigns from anon, authenticated;
revoke all on table public.campaign_items from anon, authenticated;
revoke all on table public.storefront_settings from anon, authenticated;
grant select on table public.campaigns to anon, authenticated;
grant select, insert, update, delete on table public.campaigns to authenticated;
grant select on table public.campaign_items to anon, authenticated;
grant select, insert, update, delete on table public.campaign_items to authenticated;
grant select on table public.storefront_settings to anon, authenticated;
grant insert, update, delete on table public.storefront_settings to authenticated;
revoke all on function public.append_campaign_items(uuid, text[]) from public;
grant execute on function public.append_campaign_items(uuid, text[]) to authenticated;

drop policy if exists "Public can read active campaigns" on public.campaigns;
drop policy if exists "Public can read featured box campaign" on public.campaigns;
create policy "Public can read featured box campaign"
  on public.campaigns for select to anon
  using (exists (select 1 from public.storefront_settings where storefront_settings.id = 'homepage' and storefront_settings.active_featured_box_key = campaigns.key));

drop policy if exists "Admins manage campaigns" on public.campaigns;
drop policy if exists "Admins read campaigns" on public.campaigns;
drop policy if exists "Admins insert campaigns" on public.campaigns;
drop policy if exists "Admins update campaigns" on public.campaigns;
drop policy if exists "Admins delete campaigns" on public.campaigns;
create policy "Admins read campaigns"
  on public.campaigns for select to authenticated
  using ((select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')));
create policy "Admins insert campaigns"
  on public.campaigns for insert to authenticated
  with check ((select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')));
create policy "Admins update campaigns"
  on public.campaigns for update to authenticated
  using ((select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')))
  with check ((select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')));
create policy "Admins delete campaigns"
  on public.campaigns for delete to authenticated
  using ((select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')));

drop policy if exists "Public can read active campaign items" on public.campaign_items;
drop policy if exists "Public can read featured box items" on public.campaign_items;
create policy "Public can read featured box items"
  on public.campaign_items for select to anon
  using (
    is_active = true
    and exists (select 1 from public.campaigns join public.storefront_settings on storefront_settings.active_featured_box_key = campaigns.key where campaigns.id = campaign_items.campaign_id and storefront_settings.id = 'homepage')
    and exists (select 1 from public.products where products.id = campaign_items.product_id and products.is_active = true)
  );

drop policy if exists "Admins manage campaign items" on public.campaign_items;
drop policy if exists "Admins read campaign items" on public.campaign_items;
drop policy if exists "Admins insert campaign items" on public.campaign_items;
drop policy if exists "Admins update campaign items" on public.campaign_items;
drop policy if exists "Admins delete campaign items" on public.campaign_items;
create policy "Admins read campaign items"
  on public.campaign_items for select to authenticated
  using ((select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')));
create policy "Admins insert campaign items"
  on public.campaign_items for insert to authenticated
  with check ((select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')));
create policy "Admins update campaign items"
  on public.campaign_items for update to authenticated
  using ((select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')))
  with check ((select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')));
create policy "Admins delete campaign items"
  on public.campaign_items for delete to authenticated
  using ((select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')));

drop policy if exists "Public can read storefront settings" on public.storefront_settings;
create policy "Public can read storefront settings"
  on public.storefront_settings for select to anon
  using (id = 'homepage');

drop policy if exists "Admins manage storefront settings" on public.storefront_settings;
drop policy if exists "Admins read storefront settings" on public.storefront_settings;
drop policy if exists "Admins insert storefront settings" on public.storefront_settings;
drop policy if exists "Admins update storefront settings" on public.storefront_settings;
drop policy if exists "Admins delete storefront settings" on public.storefront_settings;
create policy "Admins read storefront settings"
  on public.storefront_settings for select to authenticated
  using ((select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')));
create policy "Admins insert storefront settings"
  on public.storefront_settings for insert to authenticated
  with check (id = 'homepage' and (select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')));
create policy "Admins update storefront settings"
  on public.storefront_settings for update to authenticated
  using ((select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')))
  with check (id = 'homepage' and (select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')));
create policy "Admins delete storefront settings"
  on public.storefront_settings for delete to authenticated
  using ((select exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin')));

insert into public.campaigns (key, name, is_active)
values ('tet_2027', 'Tết 2027', false)
on conflict (key) do update set name = excluded.name, updated_at = now();

insert into public.storefront_settings (id, active_featured_box_key)
values ('homepage', 'tet_2027')
on conflict (id) do nothing;

-- Seed the six products used by the approved Tết 2027 storefront fixture.
-- This only creates Box membership references; product rows remain the source of truth.
insert into public.campaign_items (campaign_id, product_id, sort_order, is_active)
select c.id, seed.product_id, seed.sort_order, true
  from public.campaigns c
  join (values
    ('samsung-ua43m77ha-43-inch', 1),
    ('xoami-l98mc-stwn-98-inch', 2),
    ('samsung-qa65qn70f-65-inch', 3),
    ('lg-75um6970-75-inch', 4),
    ('samsung-ua43u8500f-43-inch', 5),
    ('tcl-65a400-pro-65-inch', 6)
  ) as seed(product_id, sort_order) on true
  join public.products p on p.id = seed.product_id
 where c.key = 'tet_2027'
on conflict (campaign_id, product_id) do update
  set sort_order = excluded.sort_order,
      is_active = true,
      updated_at = now();

-- The existing hero_banners placement field is the stable identity for the
-- three optional mini-banner slots. Empty image_url is intentional until an
-- administrator uploads an image; no placeholder artwork is inserted.
create unique index if not exists hero_banners_mini_slot_placement_key
  on public.hero_banners (placement)
  where placement in ('home_mini_banner_01','home_mini_banner_02','home_mini_banner_03');

insert into public.hero_banners (
  id, title, image_url, storage_path, alt_text, sort_order, is_active, placement, link_url
)
values
  ('00000000-2027-4e01-8000-000000000001'::uuid, 'Mini banner 01', '', null, 'Mini banner 01', 1, true, 'home_mini_banner_01', null),
  ('00000000-2027-4e01-8000-000000000002'::uuid, 'Mini banner 02', '', null, 'Mini banner 02', 2, true, 'home_mini_banner_02', null),
  ('00000000-2027-4e01-8000-000000000003'::uuid, 'Mini banner 03', '', null, 'Mini banner 03', 3, true, 'home_mini_banner_03', null)
on conflict (id) do update set
  title = excluded.title,
  image_url = excluded.image_url,
  storage_path = excluded.storage_path,
  alt_text = excluded.alt_text,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  placement = excluded.placement,
  link_url = excluded.link_url,
  updated_at = now();

