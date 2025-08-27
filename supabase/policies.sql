-- ========= USERS TABLE =========
-- 1. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies
-- Users can see all other users' profiles.
CREATE POLICY "Allow all users to read user profiles" ON public.users FOR SELECT USING (true);
-- Users can only update their own profile.
CREATE POLICY "Allow user to update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);


-- ========= ADS TABLE =========
-- 1. Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies
-- All users can see all ads.
CREATE POLICY "Allow all users to read ads" ON public.ads FOR SELECT USING (true);
-- Logged-in users can insert new ads for themselves.
CREATE POLICY "Allow user to insert their own ad" ON public.ads FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can only update their own ads.
CREATE POLICY "Allow user to update their own ad" ON public.ads FOR UPDATE USING (auth.uid() = user_id);
-- Users can only delete their own ads.
CREATE POLICY "Allow user to delete their own ad" ON public.ads FOR DELETE USING (auth.uid() = user_id);


-- ========= CONVERSATIONS & MESSAGES =========
-- 1. Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies
-- Users can only access conversations they are a part of.
CREATE POLICY "Allow user to access their own conversations" ON public.conversations FOR SELECT USING (auth.uid() = ANY(participant_ids));
-- Users can only see messages in conversations they are a part of.
CREATE POLICY "Allow user to read messages in their conversations" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM conversations
    WHERE conversations.id = messages.conversation_id
  )
);
-- Users can only insert messages as themselves.
CREATE POLICY "Allow user to insert messages as themselves" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);


-- ========= REVIEWS TABLE =========
-- 1. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies
-- All users can read all reviews.
CREATE POLICY "Allow all users to read reviews" ON public.reviews FOR SELECT USING (true);
-- Logged-in users can insert reviews.
CREATE POLICY "Allow user to insert a review" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Users can only update their own reviews.
CREATE POLICY "Allow user to update their own review" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);
-- Users can only delete their own reviews.
CREATE POLICY "Allow user to delete their own review" ON public.reviews FOR DELETE USING (auth.uid() = reviewer_id);


-- ========= NOTIFICATIONS TABLE =========
-- 1. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies
-- Users can only see their own notifications.
CREATE POLICY "Allow user to read their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
-- Users can only update their own notifications (e.g., mark as read).
CREATE POLICY "Allow user to update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);


-- ========= TRIGGER FOR NEW USERS =========
-- Function to create a public user profile when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role, profile_picture, contact, referral_code, referred_by)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    (new.raw_user_meta_data->>'role')::text,
    new.raw_user_meta_data->>'profile_picture',
    (new.raw_user_meta_data->>'contact')::jsonb,
    new.raw_user_meta_data->>'referral_code',
    (new.raw_user_meta_data->>'referred_by')::uuid
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function after a new user is created.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ========= REALTIME PUBLICATION =========
-- Enable real-time for the messages table
begin;
  -- remove the supabase_realtime publication
  drop publication if exists supabase_realtime;

  -- re-create the publication but don't add any tables
  create publication supabase_realtime;
commit;

-- add the tables you want to listen to
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;


-- ========= PROFILE UPDATE LOGS TABLE =========
-- 1. Enable RLS
ALTER TABLE public.profile_update_logs ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies
-- This table should only be written to by the `log_and_check_profile_update` function, which is a security definer.
-- No user should be able to select, insert, update, or delete from it directly.
CREATE POLICY "Deny all access" ON public.profile_update_logs FOR ALL USING (false) WITH CHECK (false);


-- ========= PAYMENT METHODS TABLE =========
-- 1. Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies
-- Admins can manage payment methods.
CREATE POLICY "Allow admins full access to payment methods" ON public.payment_methods FOR ALL
USING (auth.role() = 'admin')  WITH CHECK (auth.role() = 'admin');

-- Authenticated users can read active payment methods.
CREATE POLICY "Allow users to read active payment methods" ON public.payment_methods FOR SELECT
USING (auth.role() = 'authenticated');
