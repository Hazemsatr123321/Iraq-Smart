-- Function to get demand hotspots (count of ads per province)
create or replace function get_demand_hotspots()
returns table(province text, count bigint) as $$
begin
  return query
  select
    a.province,
    count(a.id)
  from
    ads a
  group by
    a.province
  order by
    count(a.id) desc;
end;
$$ language plpgsql;

-- Function to get product opportunities (comparing RFQs and Ads)
create or replace function get_product_opportunities()
returns table(product_name text, demand bigint, supply bigint) as $$
begin
  return query
  with rfq_counts as (
    select category, count(id) as demand_count from rfqs group by category
  ),
  ad_counts as (
    select category, count(id) as supply_count from ads group by category
  )
  select
    coalesce(rc.category, ac.category) as product_name,
    coalesce(rc.demand_count, 0) as demand,
    coalesce(ac.supply_count, 0) as supply
  from
    rfq_counts rc
  full outer join
    ad_counts ac on rc.category = ac.category
  where
    coalesce(rc.demand_count, 0) > coalesce(ac.supply_count, 0);
end;
$$ language plpgsql;

-- Function to calculate partnership score
create or replace function calculate_partnership_score(user_id_1 uuid, user_id_2 uuid)
returns table(deal_count bigint, avg_rating float) as $$
begin
  return query
  select
    (select count(*) from deal_memos where approver_ids @> array[user_id_1, user_id_2]),
    (select avg(rating) from reviews where (reviewer_id = user_id_1 and seller_id = user_id_2) or (reviewer_id = user_id_2 and seller_id = user_id_1));
end;
$$ language plpgsql;
