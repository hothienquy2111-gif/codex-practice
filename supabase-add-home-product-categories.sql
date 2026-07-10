-- Safe draft: add reusable home-product category fields to public.products.
-- Do NOT run automatically. Review in Supabase SQL Editor after confirming the target project.
-- Purpose:
-- - category: main product area, e.g. san-pham-gia-dinh
-- - subcategory: mini category, e.g. may-giat, tu-lanh, dieu-hoa, do-gia-dung
-- - capacity_or_size: appliance-friendly capacity/size text, e.g. 10.5kg or Giặt 12kg, sấy 8kg

alter table public.products
add column if not exists category text;

alter table public.products
add column if not exists subcategory text;

alter table public.products
add column if not exists capacity_or_size text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_home_product_subcategory_check'
  ) then
    alter table public.products
    add constraint products_home_product_subcategory_check
    check (
      subcategory is null
      or subcategory in ('may-giat', 'tu-lanh', 'dieu-hoa', 'do-gia-dung')
    );
  end if;
end $$;

comment on column public.products.category is
'Main product area/category. Use san-pham-gia-dinh for home/appliance products.';

comment on column public.products.subcategory is
'Home product mini category: may-giat, tu-lanh, dieu-hoa, do-gia-dung.';

comment on column public.products.capacity_or_size is
'Appliance-friendly size/capacity text, such as 10.5kg, 15kg, or Giặt 12kg, sấy 8kg.';
