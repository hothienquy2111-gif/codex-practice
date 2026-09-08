-- Production repair for public.append_campaign_items(uuid, text[]).
-- Preserves the existing invoker security model, grants, advisory lock,
-- sort-order allocation, and campaign/product upsert behavior.
create or replace function public.append_campaign_items(
  p_campaign_id uuid,
  p_product_ids text[]
)
returns table(product_id text, sort_order integer)
language plpgsql
set search_path to 'public'
as $function$
#variable_conflict use_column
declare
  v_start_order integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_campaign_id::text, 0));

  select coalesce(max(ci.sort_order), 0)
    into v_start_order
    from public.campaign_items as ci
   where ci.campaign_id = p_campaign_id;

  return query
  with requested as (
    select distinct on (input_row.input_product_id)
      input_row.input_product_id,
      input_row.input_ordinal::integer as ordinal
    from unnest(p_product_ids) with ordinality as input_row(input_product_id, input_ordinal)
    order by input_row.input_product_id, input_row.input_ordinal
  ),
  normalized as (
    select
      requested.input_product_id,
      row_number() over (order by requested.ordinal)::integer as ordinal
    from requested
  ),
  inserted as (
    insert into public.campaign_items (campaign_id, product_id, sort_order, is_active)
    select
      p_campaign_id,
      normalized.input_product_id,
      v_start_order + normalized.ordinal,
      true
    from normalized
    on conflict on constraint campaign_items_unique_product do update
      set is_active = true,
          updated_at = now()
    returning
      campaign_items.product_id as persisted_product_id,
      campaign_items.sort_order as persisted_sort_order
  )
  select
    inserted.persisted_product_id,
    inserted.persisted_sort_order
  from inserted
  order by inserted.persisted_sort_order;
end;
$function$;
