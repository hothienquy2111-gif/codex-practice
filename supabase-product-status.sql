-- Manual migration for Anh Minh Store product business status.
-- Review and run this in Supabase SQL Editor. It is idempotent.

alter table public.products
add column if not exists stock_status text not null default 'available';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_stock_status_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
    add constraint products_stock_status_check
    check (stock_status in ('available', 'sold', 'coming_soon', 'hidden'));
  end if;
end $$;
