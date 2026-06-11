-- Chạy thủ công trong Supabase SQL Editor.
-- File này thêm cột lưu trữ đơn hàng và policy cho admin.

alter table public.orders
add column if not exists is_archived boolean not null default false;

alter table public.orders
add column if not exists archived_at timestamptz;

alter table public.orders enable row level security;

-- Xoá policy cũ để có thể chạy lại file an toàn.
drop policy if exists "Admins can read orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;
drop policy if exists "Admins can delete orders" on public.orders;

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

create policy "Admins can delete orders"
on public.orders for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
