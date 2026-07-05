-- Add optional product sticker settings.
-- Safe draft only: run manually in Supabase SQL Editor after review.
-- Final logic:
-- - Category sticker can stay automatic by product type.
-- - Promo sticker is manual only and defaults to none.
-- This migration does not change RLS, policies, auth, storage, or unrelated product fields.

alter table public.products
add column if not exists category_sticker_mode text default 'auto';

alter table public.products
add column if not exists promo_sticker_mode text default 'none';

alter table public.products
add column if not exists custom_sticker_url text;

alter table public.products
alter column category_sticker_mode set default 'auto';

alter table public.products
alter column promo_sticker_mode set default 'none';

update public.products
set category_sticker_mode = 'auto'
where category_sticker_mode is null;

update public.products
set promo_sticker_mode = 'none'
where promo_sticker_mode is null
   or promo_sticker_mode = 'auto';

alter table public.products
drop constraint if exists products_category_sticker_mode_check;

alter table public.products
add constraint products_category_sticker_mode_check
check (category_sticker_mode in ('auto', 'new', 'used', 'none'))
not valid;

alter table public.products
drop constraint if exists products_promo_sticker_mode_check;

alter table public.products
add constraint products_promo_sticker_mode_check
check (promo_sticker_mode in ('none', 'wc', 'click2', 'custom'))
not valid;

comment on column public.products.category_sticker_mode is
'Controls category sticker display: auto, new, used, none. Default auto follows product type.';

comment on column public.products.promo_sticker_mode is
'Controls promo sticker display manually: none, wc, click2, custom. Default none; auto is obsolete and not allowed.';

comment on column public.products.custom_sticker_url is
'Custom promo sticker asset path or URL used only when promo_sticker_mode is custom.';
