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

-- Function to feature a specific ad for a certain number of days
create or replace function feature_ad(p_ad_id uuid, p_duration_days integer)
returns void as $$
declare
  ad_owner_id uuid;
  current_user_id uuid := auth.uid();
  user_rewards integer;
begin
  -- Check if user is authenticated
  if current_user_id is null then
    raise exception 'Authentication required to feature an ad.';
  end if;

  -- Get the ad's owner
  select user_id into ad_owner_id from public.ads where id = p_ad_id;

  -- Check if the ad exists and if the current user owns it
  if ad_owner_id is null then
    raise exception 'Ad not found.';
  end if;

  if ad_owner_id != current_user_id then
    raise exception 'You can only feature your own ads.';
  end if;

  -- Check for available rewards first
  select available_feature_rewards into user_rewards from public.users where id = current_user_id;

  if user_rewards > 0 then
    -- Use a reward
    update public.users
    set available_feature_rewards = available_feature_rewards - 1
    where id = current_user_id;
  else
    -- Here you would typically handle payment verification.
    -- For now, we assume payment is verified before calling this function.
    -- The function's main job is to update the ad status.
    null; -- Placeholder for payment logic which happens client-side for this app
  end if;

  -- Update the ad to be featured
  update public.ads
  set
    featured = true,
    featured_until = now() + (p_duration_days || ' days')::interval
  where id = p_ad_id;

end;
$$ language plpgsql security definer;

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

-- Function to check for suspicious ad posting activity
create or replace function check_suspicious_ad_posting(user_id_param uuid)
returns void as $$
declare
  ad_count integer;
begin
  -- Count ads created by the user in the last hour
  select count(*)
  into ad_count
  from ads
  where user_id = user_id_param and created_at > (now() - interval '1 hour');

  -- If count exceeds threshold, log it as suspicious
  if ad_count > 5 then
    insert into suspicious_activities (description, related_user_id, priority)
    values (
      'User posted ' || ad_count || ' ads in the last hour.',
      user_id_param,
      'medium'
    );
  end if;
end;
$$ language plpgsql security definer;

-- Function to log a profile update and check for suspicious frequency
create or replace function log_and_check_profile_update(user_id_param uuid)
returns void as $$
declare
  update_count integer;
begin
  -- Log the update event
  insert into public.profile_update_logs (user_id) values (user_id_param);

  -- Count profile updates by the user in the last 24 hours
  select count(*)
  into update_count
  from profile_update_logs
  where
    user_id = user_id_param and
    created_at > (now() - interval '24 hours');

  -- If count exceeds threshold, log it as suspicious
  if update_count > 2 then
    insert into suspicious_activities (description, related_user_id, priority)
    values (
      'User updated their profile ' || update_count || ' times in the last 24 hours.',
      user_id_param,
      'medium'
    );
  end if;
end;
$$ language plpgsql security definer;

-- Function to check for suspicious chat message activity
create or replace function check_suspicious_messages(sender_id_param uuid)
returns void as $$
declare
  message_count integer;
begin
  -- Count messages sent by the user in the last 5 minutes
  select count(*)
  into message_count
  from messages
  where
    sender_id = sender_id_param and
    "timestamp" > (now() - interval '5 minutes');

  -- If count exceeds threshold, log it as suspicious
  if message_count > 20 then
    insert into suspicious_activities (description, related_user_id, priority)
    values (
      'User sent ' || message_count || ' messages in the last 5 minutes.',
      sender_id_param,
      'medium'
    );
  end if;
end;
$$ language plpgsql security definer;

-- Function to check for suspicious RFQ creation activity
create or replace function check_suspicious_rfqs(user_id_param uuid)
returns void as $$
declare
  rfq_count integer;
begin
  -- Count RFQs created by the user in the last hour
  select count(*)
  into rfq_count
  from rfqs
  where
    user_id = user_id_param and
    "timestamp" > (now() - interval '1 hour');

  -- If count exceeds threshold, log it as suspicious
  if rfq_count > 10 then
    insert into suspicious_activities (description, related_user_id, priority)
    values (
      'User created ' || rfq_count || ' RFQs in the last hour.',
      user_id_param,
      'medium'
    );
  end if;
end;
$$ language plpgsql security definer;

-- Function to check for suspicious review activity
create or replace function check_suspicious_reviews(seller_id_param uuid)
returns void as $$
declare
  negative_review_count integer;
begin
  -- Count negative reviews (rating 1 or 2) for the seller in the last 24 hours
  select count(*)
  into negative_review_count
  from reviews
  where
    seller_id = seller_id_param and
    rating <= 2 and
    "timestamp" > (now() - interval '24 hours');

  -- If count exceeds threshold, log it as suspicious
  if negative_review_count > 3 then
    insert into suspicious_activities (description, related_user_id, priority)
    values (
      'User received ' || negative_review_count || ' negative reviews in the last 24 hours.',
      seller_id_param,
      'high'
    );
  end if;
end;
$$ language plpgsql security definer;
