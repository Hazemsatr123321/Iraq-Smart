

import { AppState, User, Ad, Category, Province, AppSettings, ChatConversation, ChatMessageDbRow } from '../types';


const MOCK_USERS: User[] = [
    {
        id: 'user-admin',
        email: 'admin@example.com',
        name: 'المدير العام',
        role: 'admin',
        profile_picture: 'https://i.pravatar.cc/150?u=admin',
        store_name: 'إدارة سوق العراق الذكي',
        contact: { phone: '07700000000', whatsapp: '07700000000' },
        favorite_ad_ids: [],
        watched_ad_ids: [],
        reputation: 'Verified Pro',
        is_verified: true,
        referral_code: 'ADMIN123',
        referrals: [],
        available_feature_rewards: 100,
    },
];

const MOCK_ADS: Ad[] = [];

const MOCK_CATEGORIES: Category[] = [];

const MOCK_PROVINCES: Province[] = [];

const MOCK_SETTINGS: AppSettings = {
    id: 1,
    google_ads_enabled: false,
    featured_ad_price: 5000,
    announcement_text: '',
    announcement_type: 'info',
    is_announcement_active: false,
    maintenance_mode: false,
    zain_cash_number: '07800000000',
    asia_pay_number: '07700000000',
    charity_program_description: 'يتم تعريف هذا البرنامج من لوحة تحكم المدير.',
    small_projects_program_description: 'يتم تعريف هذا البرنامج من لوحة تحكم المدير.'
};

const MOCK_CONVERSATIONS: ChatConversation[] = [];

const MOCK_MESSAGES: ChatMessageDbRow[] = [];


export const initialState: AppState = {
    users: MOCK_USERS,
    ads: MOCK_ADS,
    categories: MOCK_CATEGORIES,
    provinces: MOCK_PROVINCES,
    settings: MOCK_SETTINGS,
    reviews: [],
    notifications: [],
    rfqs: [],
    offers: [],
    featureFlags: [{id: 'marketAdvisor', name: 'مستشار السوق', description: '...', is_enabled: true}],
    auctions: [],
    personalizedOffers: [],
    stockWatches: [],
    marketBriefs: [],
    systemHealth: { api_status: 'operational', database_status: 'operational', ai_service_status: 'operational' },
    suspiciousActivities: [],
    opportunities: [],
    dealMemos: [],
    smartPayments: [],
    negotiationSessions: [],
    conversations: MOCK_CONVERSATIONS,
    messages: MOCK_MESSAGES,
    externalAds: [],
    campaigns: [],
};