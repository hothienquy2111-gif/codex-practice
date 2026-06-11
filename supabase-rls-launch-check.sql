-- Supabase RLS launch checklist for ANH MINH STORE
-- Review this file carefully, then run manually in Supabase SQL Editor if it matches the live schema.
-- Do not run from the website frontend. Do not use or expose a service role key.
-- This file is intentionally conservative: it enables RLS, adds public read only for active public content,
-- allows public order creation only, and reserves management policies for authenticated admin users.

-- Existing schema inspected in this repo uses:
-- public.profiles(id, role, full_name), public.products(is_active), public.orders(status), public.hero_banners(is_active).
-- The website JS currently reads products and hero_banners publicly, inserts orders publicly, and manages data in admin.html.

-- 1) Admin helper. Uses profiles.role = 'admin'. SECURITY DEFINER avoids recursive RLS problems when policies check roles.
create or replace function public.anh_minh_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

revoke all on function public.anh_minh_is_admin() from public;
grant execute on function public.anh_minh_is_admin() to authenticated;

-- 2) profiles: public visitors must not read admin/profile data. Authenticated users can read their own row;
-- admins can read and manage profiles when needed for admin role checks.
do $$
begin
  if to_regclass('public.profiles') is not null then
    alter table public.profiles enable row level security;

    drop policy if exists "Launch users read own profile" on public.profiles;
    create policy "Launch users read own profile"
    on public.profiles for select
    to authenticated
    using (id = auth.uid());

    drop policy if exists "Launch admins read profiles" on public.profiles;
    create policy "Launch admins read profiles"
    on public.profiles for select
    to authenticated
    using (public.anh_minh_is_admin());

    drop policy if exists "Launch admins insert profiles" on public.profiles;
    create policy "Launch admins insert profiles"
    on public.profiles for insert
    to authenticated
    with check (public.anh_minh_is_admin());

    drop policy if exists "Launch admins update profiles" on public.profiles;
    create policy "Launch admins update profiles"
    on public.profiles for update
    to authenticated
    using (public.anh_minh_is_admin())
    with check (public.anh_minh_is_admin());
  end if;
end $$;

-- 3) products: public visitors can SELECT active products only. Admins can manage all products.
do $$
begin
  if to_regclass('public.products') is not null then
    alter table public.products enable row level security;

    drop policy if exists "Launch public read active products" on public.products;
    create policy "Launch public read active products"
    on public.products for select
    to anon, authenticated
    using (is_active = true);

    drop policy if exists "Launch admins read all products" on public.products;
    create policy "Launch admins read all products"
    on public.products for select
    to authenticated
    using (public.anh_minh_is_admin());

    drop policy if exists "Launch admins insert products" on public.products;
    create policy "Launch admins insert products"
    on public.products for insert
    to authenticated
    with check (public.anh_minh_is_admin());

    drop policy if exists "Launch admins update products" on public.products;
    create policy "Launch admins update products"
    on public.products for update
    to authenticated
    using (public.anh_minh_is_admin())
    with check (public.anh_minh_is_admin());

    drop policy if exists "Launch admins delete products" on public.products;
    create policy "Launch admins delete products"
    on public.products for delete
    to authenticated
    using (public.anh_minh_is_admin());
  end if;
end $$;

-- 4) orders: public visitors can INSERT an order request only. They must not SELECT all orders,
-- UPDATE orders, or DELETE orders. Admins can read and update/manage orders.
do $$
begin
  if to_regclass('public.orders') is not null then
    alter table public.orders enable row level security;

    drop policy if exists "Launch public create orders" on public.orders;
    create policy "Launch public create orders"
    on public.orders for insert
    to anon, authenticated
    with check (coalesce(status, 'new') = 'new');

    drop policy if exists "Launch admins read orders" on public.orders;
    create policy "Launch admins read orders"
    on public.orders for select
    to authenticated
    using (public.anh_minh_is_admin());

    drop policy if exists "Launch admins update orders" on public.orders;
    create policy "Launch admins update orders"
    on public.orders for update
    to authenticated
    using (public.anh_minh_is_admin())
    with check (public.anh_minh_is_admin());

    drop policy if exists "Launch admins delete orders" on public.orders;
    create policy "Launch admins delete orders"
    on public.orders for delete
    to authenticated
    using (public.anh_minh_is_admin());
  end if;
end $$;

-- 5) hero_banners: public visitors can SELECT active banners used by the homepage carousel only.
-- Admins can manage banners in admin.html.
do $$
begin
  if to_regclass('public.hero_banners') is not null then
    alter table public.hero_banners enable row level security;

    drop policy if exists "Launch public read active hero banners" on public.hero_banners;
    create policy "Launch public read active hero banners"
    on public.hero_banners for select
    to anon, authenticated
    using (is_active = true);

    drop policy if exists "Launch admins read all hero banners" on public.hero_banners;
    create policy "Launch admins read all hero banners"
    on public.hero_banners for select
    to authenticated
    using (public.anh_minh_is_admin());

    drop policy if exists "Launch admins insert hero banners" on public.hero_banners;
    create policy "Launch admins insert hero banners"
    on public.hero_banners for insert
    to authenticated
    with check (public.anh_minh_is_admin());

    drop policy if exists "Launch admins update hero banners" on public.hero_banners;
    create policy "Launch admins update hero banners"
    on public.hero_banners for update
    to authenticated
    using (public.anh_minh_is_admin())
    with check (public.anh_minh_is_admin());

    drop policy if exists "Launch admins delete hero banners" on public.hero_banners;
    create policy "Launch admins delete hero banners"
    on public.hero_banners for delete
    to authenticated
    using (public.anh_minh_is_admin());
  end if;
end $$;

-- 6) other_products: not present in the inspected SQL/JS at the time of this checklist.
-- If your live Supabase project has public.other_products, admins can manage it. Public read is added only
-- when an is_active column exists so this block does not assume the live table shape blindly.
do $$
begin
  if to_regclass('public.other_products') is not null then
    alter table public.other_products enable row level security;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'other_products'
        and column_name = 'is_active'
    ) then
      drop policy if exists "Launch public read active other products" on public.other_products;
      create policy "Launch public read active other products"
      on public.other_products for select
      to anon, authenticated
      using (is_active = true);
    else
      raise notice 'public.other_products exists but has no is_active column; review public SELECT policy manually before launch.';
    end if;

    drop policy if exists "Launch admins read all other products" on public.other_products;
    create policy "Launch admins read all other products"
    on public.other_products for select
    to authenticated
    using (public.anh_minh_is_admin());

    drop policy if exists "Launch admins insert other products" on public.other_products;
    create policy "Launch admins insert other products"
    on public.other_products for insert
    to authenticated
    with check (public.anh_minh_is_admin());

    drop policy if exists "Launch admins update other products" on public.other_products;
    create policy "Launch admins update other products"
    on public.other_products for update
    to authenticated
    using (public.anh_minh_is_admin())
    with check (public.anh_minh_is_admin());

    drop policy if exists "Launch admins delete other products" on public.other_products;
    create policy "Launch admins delete other products"
    on public.other_products for delete
    to authenticated
    using (public.anh_minh_is_admin());
  end if;
end $$;

-- 7) Storage reminder for existing buckets from supabase-schema.sql:
-- product-images and site-banners are intended to be public read buckets.
-- Keep upload/update/delete policies restricted to authenticated admins only.
-- Re-check Storage > Policies in Supabase Dashboard before launch.

-- Manual launch review checklist:
-- [ ] Confirm anon can SELECT only active rows from products and hero_banners.
-- [ ] Confirm anon cannot SELECT, UPDATE, or DELETE orders.
-- [ ] Confirm anon can INSERT orders with status new only.
-- [ ] Confirm anon cannot INSERT/UPDATE/DELETE products, banners, profiles, or other_products.
-- [ ] Confirm an authenticated admin profile exists with role = 'admin'.
-- [ ] Confirm admin.html can still read profiles.role and manage products/orders/banners after policies are applied.
