-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    web_authn_credential_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ads Table
CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price TEXT NOT NULL,
    min_quantity INTEGER NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    province TEXT NOT NULL,
    images TEXT[],
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    featured BOOLEAN DEFAULT false,
    featured_until TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    auction_id UUID,
    price_tiers JSONB,
    views INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    flash_deal JSONB,
    ai_quality_verification_status TEXT DEFAULT 'none',
    is_charitable BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    subcategories TEXT[]
);

-- Provinces Table
CREATE TABLE provinces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES ads(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ DEFAULT now(),
    related_id TEXT
);
