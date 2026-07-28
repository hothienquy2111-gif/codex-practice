-- Anh Minh Store admin security hardening
-- DRAFT ONLY: review in Supabase SQL Editor before execution.
-- This file was created from a read-only audit of project urmpvtwmjsdptvhuains.
-- It does not change auth.users, buckets, product data, or public storefront rows.

-- ============================================================
-- 1. PREFLIGHT / AUDIT QUERIES (READ ONLY)
-- ============================================================

select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where (schemaname = 'public'
    and tablename in ('profiles', 'products', 'orders', 'hero_banners', 'sticker_assets'))
   or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, policyname;

select
  table_schema,
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where grantee in ('anon', 'authenticated')
  and table_schema = 'public'
  and table_name in ('profiles', 'products', 'orders', 'hero_banners', 'sticker_assets')
order by table_name, grantee, privilege_type;

select id, name, public
from storage.buckets
where id in ('product-images', 'site-banners')
order by id;

-- ============================================================
-- 2. PROPOSED POLICY AND GRANT CHANGES
-- ============================================================

begin;

-- RLS does not govern TRUNCATE. Remove table privileges that the browser apps
-- do not need. Keep normal authenticated DML grants where admin RLS policies
-- are responsible for authorization.
revoke truncate, trigger, references
on table
  public.profiles,
  public.products,
  public.orders,
  public.hero_banners,
  public.sticker_assets
from anon, authenticated;

-- Anonymous storefront users only need public reads plus the existing,
-- RLS-constrained order INSERT flow.
revoke insert, update, delete on table public.profiles from anon;
revoke insert, update, delete on table public.products from anon;
revoke insert, update, delete on table public.hero_banners from anon;
revoke insert, update, delete on table public.sticker_assets from anon;
revoke select, update, delete on table public.orders from anon;

-- The browser app never manages profiles. Role verification only needs SELECT
-- on the authenticated user's own profile through the existing RLS policy.
revoke insert, update, delete on table public.profiles from authenticated;

-- Replace the three audited sticker policies that currently authorize every
-- authenticated user with explicit profiles.role = 'admin' checks.
drop policy if exists "sticker_assets_select_authenticated" on public.sticker_assets;
drop policy if exists "sticker_assets_insert_authenticated" on public.sticker_assets;
drop policy if exists "sticker_assets_update_authenticated" on public.sticker_assets;
drop policy if exists "Admins can read sticker assets" on public.sticker_assets;
drop policy if exists "Admins can insert sticker assets" on public.sticker_assets;
drop policy if exists "Admins can update sticker assets" on public.sticker_assets;
drop policy if exists "Admins can delete sticker assets" on public.sticker_assets;

create policy "Admins can read sticker assets"
on public.sticker_assets
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

create policy "Admins can insert sticker assets"
on public.sticker_assets
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

create policy "Admins can update sticker assets"
on public.sticker_assets
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

create policy "Admins can delete sticker assets"
on public.sticker_assets
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

-- Both buckets are public, so direct public object URLs continue to work
-- without a broad storage.objects SELECT policy. Replace broad listing access
-- with admin-only SELECT so authenticated admin uploads/upserts remain usable.
drop policy if exists "Public can read product images" on storage.objects;
drop policy if exists "Public can read site banners" on storage.objects;
drop policy if exists "Admins can select product images" on storage.objects;
drop policy if exists "Admins can select site banners" on storage.objects;

create policy "Admins can select product images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

create policy "Admins can select site banners"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'site-banners'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

commit;

-- ============================================================
-- 3. VERIFICATION QUERIES (READ ONLY, RUN AFTER REVIEW/APPLY)
-- ============================================================

select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where (schemaname = 'public' and tablename = 'sticker_assets')
   or (schemaname = 'storage'
       and tablename = 'objects'
       and policyname in (
         'Admins can select product images',
         'Admins can select site banners',
         'Public can read product images',
         'Public can read site banners'
       ))
order by schemaname, tablename, policyname;

select
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where grantee in ('anon', 'authenticated')
  and table_schema = 'public'
  and table_name in ('profiles', 'products', 'orders', 'hero_banners', 'sticker_assets')
order by table_name, grantee, privilege_type;

-- Also rerun Supabase Security Advisor after any approved application.

-- ============================================================
-- 4. ROLLBACK GUIDANCE (COMMENTED; DO NOT RUN BLINDLY)
-- ============================================================

-- Preferred rollback: restore the policies and grants from a reviewed database
-- backup or migration snapshot. The commands below describe the prior audited
-- state, but restoring them would reintroduce the identified weaknesses.
--
-- drop policy if exists "Admins can read sticker assets" on public.sticker_assets;
-- drop policy if exists "Admins can insert sticker assets" on public.sticker_assets;
-- drop policy if exists "Admins can update sticker assets" on public.sticker_assets;
-- drop policy if exists "Admins can delete sticker assets" on public.sticker_assets;
-- create policy "sticker_assets_select_authenticated"
--   on public.sticker_assets for select to authenticated using (true);
-- create policy "sticker_assets_insert_authenticated"
--   on public.sticker_assets for insert to authenticated with check (true);
-- create policy "sticker_assets_update_authenticated"
--   on public.sticker_assets for update to authenticated
--   using (true) with check (true);
--
-- drop policy if exists "Admins can select product images" on storage.objects;
-- drop policy if exists "Admins can select site banners" on storage.objects;
-- create policy "Public can read product images"
--   on storage.objects for select to anon, authenticated
--   using (bucket_id = 'product-images');
-- create policy "Public can read site banners"
--   on storage.objects for select to anon, authenticated
--   using (bucket_id = 'site-banners');
--
-- Re-grant only privileges confirmed necessary by the application:
-- grant references, trigger, truncate on table ... to ...;
