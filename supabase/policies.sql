-- This file contains all the Row Level Security (RLS) policies for the application.
-- It is designed to be idempotent, meaning it can be run multiple times without causing errors.

-- ========= GENERAL SETUP =========
-- Ensure the functions and triggers are defined. This is idempotent.

-- Function to create a public user profile when a new auth user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, profile_picture, contact, referral_code, referred_by)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    'user', -- Default role
    new.raw_user_meta_data->>'profile_picture',
    (new.raw_user_meta_data->>'contact')::jsonb,
    new.raw_user_meta_data->>'referral_code',
    (new.raw_user_meta_data->>'referred_by')::uuid
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a new user is created.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; -- Drop first to ensure idempotency
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========= TABLE-SPECIFIC POLICIES =========

-- Utility function to drop all policies for a table
CREATE OR REPLACE FUNCTION drop_all_policies_for_table(table_name TEXT)
RETURNS void AS $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname FROM pg_policies WHERE tablename = table_name
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON public.' || quote_ident(table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- For each table, we will:
-- 1. Drop existing policies to ensure a clean slate.
-- 2. Enable RLS.
-- 3. Create new, correct policies.

-- ========= SETTINGS TABLE =========
SELECT drop_all_policies_for_table('settings');
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage settings" ON public.settings FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

-- ========= USERS TABLE =========
SELECT drop_all_policies_for_table('users');
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to user profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow user to update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow admins to manage users" ON public.users FOR ALL USING (auth.role() = 'admin');

-- ========= CATEGORIES TABLE =========
SELECT drop_all_policies_for_table('categories');
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage categories" ON public.categories FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

-- ========= ADS TABLE =========
SELECT drop_all_policies_for_table('ads');
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to ads" ON public.ads FOR SELECT USING (true);
CREATE POLICY "Allow user to insert their own ad" ON public.ads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow user to update their own ad" ON public.ads FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow user to delete their own ad" ON public.ads FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Allow admins to manage ads" ON public.ads FOR ALL USING (auth.role() = 'admin');

-- ========= REVIEWS TABLE =========
SELECT drop_all_policies_for_table('reviews');
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow authenticated user to insert a review" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow user to update their own review" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Allow user to delete their own review" ON public.reviews FOR DELETE USING (auth.uid() = reviewer_id);
CREATE POLICY "Allow admins to manage reviews" ON public.reviews FOR ALL USING (auth.role() = 'admin');

-- ========= CONVERSATIONS TABLE =========
SELECT drop_all_policies_for_table('conversations');
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user to access conversations they are a part of" ON public.conversations FOR ALL USING (auth.uid() = ANY(participant_ids)) WITH CHECK (auth.uid() = ANY(participant_ids));

-- ========= MESSAGES TABLE =========
SELECT drop_all_policies_for_table('messages');
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user to access messages in their conversations" ON public.messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id AND auth.uid() = ANY(conversations.participant_ids)
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id AND auth.uid() = ANY(conversations.participant_ids)
  ) AND auth.uid() = sender_id
);

-- ========= NOTIFICATIONS TABLE =========
SELECT drop_all_policies_for_table('notifications');
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user to access their own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ========= PAYMENT METHODS TABLE =========
SELECT drop_all_policies_for_table('payment_methods');
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read payment methods" ON public.payment_methods FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage payment methods" ON public.payment_methods FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

-- ========= FEATURE FLAGS TABLE =========
SELECT drop_all_policies_for_table('feature_flags');
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read feature flags" ON public.feature_flags FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage feature flags" ON public.feature_flags FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

-- ========= GENERIC PUBLIC TABLES (Read-Only for users) =========
-- These tables are assumed to be managed by admins but readable by everyone.
-- A single loop could do this, but being explicit is clearer.

SELECT drop_all_policies_for_table('rfqs');
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on rfqs" ON public.rfqs FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage rfqs" ON public.rfqs FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

SELECT drop_all_policies_for_table('external_ads');
ALTER TABLE public.external_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on external_ads" ON public.external_ads FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage external_ads" ON public.external_ads FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

SELECT drop_all_policies_for_table('market_briefs');
ALTER TABLE public.market_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on market_briefs" ON public.market_briefs FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage market_briefs" ON public.market_briefs FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

SELECT drop_all_policies_for_table('opportunities');
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage opportunities" ON public.opportunities FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

SELECT drop_all_policies_for_table('stock_watches');
ALTER TABLE public.stock_watches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on stock_watches" ON public.stock_watches FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage stock_watches" ON public.stock_watches FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

SELECT drop_all_policies_for_table('auctions');
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on auctions" ON public.auctions FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage auctions" ON public.auctions FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

SELECT drop_all_policies_for_table('campaigns');
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage campaigns" ON public.campaigns FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

SELECT drop_all_policies_for_table('offers');
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage offers" ON public.offers FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');


-- ========= GENERIC AUTHENTICATED TABLES (Read-Only for users) =========
-- These tables are for logged-in users.

SELECT drop_all_policies_for_table('personalized_offers');
ALTER TABLE public.personalized_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow auth read on personalized_offers" ON public.personalized_offers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage personalized_offers" ON public.personalized_offers FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

SELECT drop_all_policies_for_table('negotiation_sessions');
ALTER TABLE public.negotiation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow auth read on negotiation_sessions" ON public.negotiation_sessions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage negotiation_sessions" ON public.negotiation_sessions FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

SELECT drop_all_policies_for_table('deal_memos');
ALTER TABLE public.deal_memos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow auth read on deal_memos" ON public.deal_memos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage deal_memos" ON public.deal_memos FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

SELECT drop_all_policies_for_table('smart_payments');
ALTER TABLE public.smart_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow auth read on smart_payments" ON public.smart_payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage smart_payments" ON public.smart_payments FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

-- ========= ADMIN-ONLY TABLES =========

SELECT drop_all_policies_for_table('suspicious_activities');
ALTER TABLE public.suspicious_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to manage suspicious_activities" ON public.suspicious_activities FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

SELECT drop_all_policies_for_table('profile_update_logs');
ALTER TABLE public.profile_update_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to manage profile_update_logs" ON public.profile_update_logs FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');


-- ========= REALTIME PUBLICATION =========
-- This setup ensures that only messages and conversations are broadcast in real-time.
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
