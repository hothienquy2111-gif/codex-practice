-- Supabase setup cho ANH MINH STORE
-- Chạy file này trong Supabase SQL Editor. Không đưa service role key vào frontend.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'staff',
  full_name text,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id text primary key,
  brand text not null,
  model text not null,
  full_name text not null,
  size text not null,
  type text not null,
  condition text,
  warranty text,
  old_price text,
  price text not null,
  badge text,
  description text,
  features jsonb default '[]'::jsonb,
  image text,
  images jsonb default '[]'::jsonb,
  overview jsonb default '[]'::jsonb,
  specifications jsonb default '[]'::jsonb,
  is_active boolean default true,
  is_featured boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  customer_note text,
  product_id text,
  product_name text not null,
  product_model text,
  product_price text,
  product_image text,
  status text not null default 'new' check (status in ('new', 'contacted', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

alter table public.products
add column if not exists is_featured boolean default false;

-- Dọn policy cũ nếu chạy lại script.
drop policy if exists "Public can read active products" on public.products;
drop policy if exists "Admins can read all products" on public.products;
drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;
drop policy if exists "Anyone can create orders" on public.orders;
drop policy if exists "Admins can read orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Admins can read profiles" on public.profiles;
drop policy if exists "Admins can manage profiles" on public.profiles;

create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "Public can read active products"
on public.products for select
to anon, authenticated
using (is_active = true);

create policy "Admins can read all products"
on public.products for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Admins can insert products"
on public.products for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Admins can update products"
on public.products for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Admins can delete products"
on public.products for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Anyone can create orders"
on public.orders for insert
to anon, authenticated
with check (status = 'new');

create policy "Admins can read orders"
on public.orders for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Admins can update orders"
on public.orders for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Storage bucket product-images:
-- Có thể tạo trong Dashboard: Storage > New bucket > product-images > Public bucket.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read product images" on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can update product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;

create policy "Public can read product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "Admins can upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Admins can update product images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
)
with check (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Tạo admin sau khi tạo Auth user:
-- insert into public.profiles (id, role, full_name)
-- values ('AUTH_USER_ID_HERE', 'admin', 'Chủ cửa hàng')
-- on conflict (id) do update set role = 'admin', full_name = excluded.full_name;

-- Homepage hero/banner management.
create table if not exists public.hero_banners (
  id uuid primary key default gen_random_uuid(),
  placement text not null default 'home_main_carousel',
  title text,
  image_url text not null,
  storage_path text,
  alt_text text,
  link_url text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.hero_banners
add column if not exists placement text not null default 'home_main_carousel';

alter table public.hero_banners
add column if not exists link_url text;

create index if not exists hero_banners_placement_active_order_idx
on public.hero_banners (placement, is_active, sort_order, created_at);

drop trigger if exists hero_banners_set_updated_at on public.hero_banners;
create trigger hero_banners_set_updated_at
before update on public.hero_banners
for each row execute function public.set_updated_at();

alter table public.hero_banners enable row level security;

drop policy if exists "Public can read active hero banners" on public.hero_banners;
drop policy if exists "Admins can read all hero banners" on public.hero_banners;
drop policy if exists "Admins can insert hero banners" on public.hero_banners;
drop policy if exists "Admins can update hero banners" on public.hero_banners;
drop policy if exists "Admins can delete hero banners" on public.hero_banners;

create policy "Public can read active hero banners"
on public.hero_banners for select
to anon, authenticated
using (is_active = true);

create policy "Admins can read all hero banners"
on public.hero_banners for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Admins can insert hero banners"
on public.hero_banners for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Admins can update hero banners"
on public.hero_banners for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Admins can delete hero banners"
on public.hero_banners for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Storage bucket site-banners:
-- Có thể tạo trong Dashboard: Storage > New bucket > site-banners > Public bucket ON.
insert into storage.buckets (id, name, public)
values ('site-banners', 'site-banners', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read site banners" on storage.objects;
drop policy if exists "Admins can upload site banners" on storage.objects;
drop policy if exists "Admins can update site banners" on storage.objects;
drop policy if exists "Admins can delete site banners" on storage.objects;

create policy "Public can read site banners"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'site-banners');

create policy "Admins can upload site banners"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'site-banners'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Admins can update site banners"
on storage.objects for update
to authenticated
using (
  bucket_id = 'site-banners'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
)
with check (
  bucket_id = 'site-banners'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Admins can delete site banners"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'site-banners'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
