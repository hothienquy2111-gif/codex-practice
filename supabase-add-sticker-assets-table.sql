-- Create reusable sticker asset library table.
-- Safe draft only: run manually in Supabase SQL Editor after review.
-- This migration does not alter products, product data, auth, storage buckets, or deployment settings.

create table if not exists public.sticker_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  storage_path text,
  sticker_type text default 'promo',
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists sticker_assets_is_active_idx
on public.sticker_assets (is_active);

create index if not exists sticker_assets_sort_order_idx
on public.sticker_assets (sort_order);

create index if not exists sticker_assets_sticker_type_idx
on public.sticker_assets (sticker_type);

comment on table public.sticker_assets is
'Reusable sticker asset library for admin-managed promo stickers.';

comment on column public.sticker_assets.id is
'Unique sticker asset id.';

comment on column public.sticker_assets.name is
'Human-friendly sticker name shown in the admin panel.';

comment on column public.sticker_assets.url is
'Public asset path or URL used by customer-facing product cards and detail pages.';

comment on column public.sticker_assets.storage_path is
'Optional Supabase Storage object path for admin-uploaded sticker files.';

comment on column public.sticker_assets.sticker_type is
'Sticker category, default promo. Reserved for future grouping such as promo or category.';

comment on column public.sticker_assets.is_active is
'Controls whether the sticker can be selected and shown.';

comment on column public.sticker_assets.sort_order is
'Manual admin ordering for sticker dropdown display.';

comment on column public.sticker_assets.created_at is
'Timestamp when the sticker asset row was created.';

comment on column public.sticker_assets.updated_at is
'Timestamp when the sticker asset row was last updated by admin logic.';

-- RLS guidance only; intentionally not executed in this draft.
-- Existing project SQL uses RLS for public admin-managed tables. Before enabling admin UI access,
-- review the final access model and add policies consistent with products/hero_banners:
--
-- alter table public.sticker_assets enable row level security;
--
-- Public read guidance, if customer pages need to load active stickers directly:
-- create policy "Public can read active sticker assets"
-- on public.sticker_assets
-- for select
-- using (is_active = true);
--
-- Admin manage guidance, if using the existing public.is_admin() helper:
-- create policy "Admins can read all sticker assets"
-- on public.sticker_assets
-- for select
-- using (public.is_admin());
--
-- create policy "Admins can insert sticker assets"
-- on public.sticker_assets
-- for insert
-- with check (public.is_admin());
--
-- create policy "Admins can update sticker assets"
-- on public.sticker_assets
-- for update
-- using (public.is_admin())
-- with check (public.is_admin());
--
-- create policy "Admins can delete sticker assets"
-- on public.sticker_assets
-- for delete
-- using (public.is_admin());
