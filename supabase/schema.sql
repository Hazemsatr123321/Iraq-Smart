-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'retailer',
    profile_picture TEXT,
    store_name TEXT,
    store_location TEXT,
    contact JSONB,
    favorite_ad_ids UUID[],
    watched_ad_ids UUID[],
    banned BOOLEAN DEFAULT false,
    reputation TEXT DEFAULT 'New Seller',
    is_verified BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES users(id),
    referrals UUID[],
    available_feature_rewards INTEGER DEFAULT 0,
    pending_referral_reward BOOLEAN DEFAULT false,
    web_authn_credential_id TEXT
);

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subcategories TEXT[]
);

-- Provinces Table
CREATE TABLE provinces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);

-- Ads Table
CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price TEXT NOT NULL,
    min_quantity INTEGER NOT NULL,
    category UUID REFERENCES categories(id),
    subcategory TEXT,
    province UUID REFERENCES provinces(id),
    images TEXT[],
    user_id UUID REFERENCES users(id) NOT NULL,
    featured BOOLEAN DEFAULT false,
    featured_until TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    rejection_reason TEXT,
    auction_id UUID,
    price_tiers JSONB,
    views INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    flash_deal JSONB,
    ai_quality_verification_status TEXT DEFAULT 'none',
    is_charitable BOOLEAN DEFAULT false,
    featured_status TEXT DEFAULT 'none',
    payment_transaction_id TEXT
);

-- StockWatch Table
CREATE TABLE stock_watches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    keywords TEXT NOT NULL,
    category UUID REFERENCES categories(id),
    province UUID REFERENCES provinces(id)
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES ads(id) NOT NULL,
    reviewer_id UUID REFERENCES users(id) NOT NULL,
    seller_id UUID REFERENCES users(id) NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- External Ads Table
CREATE TABLE external_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- App Settings Table
CREATE TABLE app_settings (
    id INTEGER PRIMARY KEY,
    google_ads_enabled BOOLEAN,
    featured_ad_price INTEGER,
    announcement_text TEXT,
    announcement_type TEXT,
    is_announcement_active BOOLEAN,
    maintenance_mode BOOLEAN,
    zain_cash_number TEXT,
    asia_pay_number TEXT,
    charity_program_description TEXT,
    small_projects_program_description TEXT
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ DEFAULT now(),
    related_id UUID
);

-- RFQs Table
CREATE TABLE rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    product_name TEXT NOT NULL,
    category UUID REFERENCES categories(id),
    quantity INTEGER NOT NULL,
    details TEXT,
    province UUID REFERENCES provinces(id),
    timestamp TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'open'
);

-- Offers Table
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID REFERENCES rfqs(id) NOT NULL,
    seller_id UUID REFERENCES users(id) NOT NULL,
    price_per_unit NUMERIC NOT NULL,
    comments TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- Feature Flags Table
CREATE TABLE feature_flags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT false
);

-- Auctions Table
CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES ads(id) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    start_price NUMERIC NOT NULL,
    current_price NUMERIC,
    bids JSONB,
    status TEXT DEFAULT 'active',
    winner_id UUID REFERENCES users(id)
);

-- Personalized Offers Table
CREATE TABLE personalized_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES ads(id) NOT NULL,
    seller_id UUID REFERENCES users(id) NOT NULL,
    discount_percentage NUMERIC,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- Market Briefs Table
CREATE TABLE market_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    content TEXT
);

-- Suspicious Activities Table
CREATE TABLE suspicious_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT,
    related_user_id UUID REFERENCES users(id),
    related_ad_id UUID REFERENCES ads(id),
    timestamp TIMESTAMPTZ DEFAULT now(),
    priority TEXT
);

-- Opportunities Table
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    type TEXT,
    title TEXT,
    description TEXT,
    related_id UUID,
    timestamp TIMESTAMTz DEFAULT now()
);

-- Deal Memos Table
CREATE TABLE deal_memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    product TEXT,
    quantity TEXT,
    price TEXT,
    terms TEXT,
    status TEXT,
    approver_ids UUID[],
    timestamp TIMESTAMPTZ DEFAULT now(),
    smart_payment_id UUID
);

-- Smart Payments Table
CREATE TABLE smart_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memo_id UUID REFERENCES deal_memos(id),
    amount NUMERIC,
    status TEXT,
    buyer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    shipping_info JSONB,
    order_history JSONB,
    dispute_reason TEXT
);

-- Negotiation Sessions Table
CREATE TABLE negotiation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES ads(id),
    buyer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    status TEXT,
    history JSONB,
    target_price NUMERIC,
    lowest_price NUMERIC
);

-- Campaigns Table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    description TEXT,
    image_url TEXT,
    goal_amount NUMERIC,
    current_amount NUMERIC,
    donors INTEGER,
    is_active BOOLEAN
);

-- Chat Conversations Table
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_ids UUID[],
    last_message JSONB
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id),
    sender_id UUID REFERENCES users(id),
    timestamp TIMESTAMPTZ DEFAULT now(),
    status TEXT,
    is_sending BOOLEAN,
    type TEXT,
    text TEXT,
    ad_details JSONB,
    memo JSONB
);

-- RLS Policies
-- Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_watches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Public tables (read-only for all)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Ads
CREATE POLICY "Ads are public" ON ads FOR SELECT USING (true);
CREATE POLICY "Users can insert their own ads" ON ads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ads" ON ads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ads" ON ads FOR DELETE USING (auth.uid() = user_id);

-- Stock Watches
CREATE POLICY "Users can manage their own stock watches" ON stock_watches FOR ALL USING (auth.uid() = user_id);

-- Reviews
CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Notifications
CREATE POLICY "Users can manage their own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- RFQs
CREATE POLICY "Users can manage their own RFQs" ON rfqs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Sellers can see relevant RFQs" ON rfqs FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'wholesaler'));

-- Offers
CREATE POLICY "Users can manage their own offers" ON offers FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Users can see offers on their RFQs" ON offers FOR SELECT USING (EXISTS (SELECT 1 FROM rfqs WHERE rfqs.id = offers.rfq_id AND rfqs.user_id = auth.uid()));

-- Chat
CREATE POLICY "Users can access their own conversations" ON chat_conversations FOR SELECT USING (auth.uid() = ANY(participant_ids));
CREATE POLICY "Users can insert messages in their conversations" ON chat_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM chat_conversations WHERE chat_conversations.id = chat_messages.conversation_id AND auth.uid() = ANY(chat_conversations.participant_ids)));
CREATE POLICY "Users can read messages in their conversations" ON chat_messages FOR SELECT USING (EXISTS (SELECT 1 FROM chat_conversations WHERE chat_conversations.id = chat_messages.conversation_id AND auth.uid() = ANY(chat_conversations.participant_ids)));

-- Public Read Policies
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON provinces FOR SELECT USING (true);
CREATE POLICY "Public read access" ON external_ads FOR SELECT USING (true);
CREATE POLICY "Public read access" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON feature_flags FOR SELECT USING (true);
CREATE POLICY "Public read access" ON market_briefs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Public read access" ON auctions FOR SELECT USING (true);

-- Storage Policies
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-images', 'ad-images', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Ad images are publicly accessible." ON storage.objects FOR SELECT USING ( bucket_id = 'ad-images' );
CREATE POLICY "Authenticated users can upload ad images." ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'ad-images' );
