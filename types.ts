// NEW Interfaces for nested object types
export interface PriceTier {
  quantity: number;
  price: string;
}

export interface FlashDeal {
  is_active: boolean;
  deal_price: string;
  end_time: string;
}

export interface UserContact {
  phone: string;
  whatsapp: string;
}

export interface ShippingInfo {
    company: string;
    tracking_number: string;
}

export type UserReputation = 'New Seller' | 'Rising Star' | 'Trusted Seller' | 'Verified Pro';

export type AdminSection = 
  | 'dashboard'
  | 'users'
  | 'ads'
  | 'reviews'
  | 'features'
  | 'content'
  | 'external_ads'
  | 'settings'
  | 'financials'
  | 'ai_tools'
  | 'social_support'
  | 'smart_safepay'
  | 'negotiations'
  | 'payment';

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: string;
  min_quantity: number;
  category: string;
  subcategory?: string;
  province: string;
  images: string[];
  user_id: string;
  featured?: boolean;
  featured_until?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  auction_id?: string; 
  price_tiers?: PriceTier[];
  views: number;
  saves: number;
  flash_deal?: FlashDeal;
  ai_quality_verification_status: 'none' | 'pending' | 'verified' | 'rejected';
  is_charitable?: boolean;
}

export type UserRole = 'admin' | 'moderator' | 'support' | 'wholesaler' | 'retailer';


export interface StockWatch {
    id: string;
    user_id: string;
    keywords: string;
    category: string;
    province: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profile_picture: string;
  store_name?: string;
  store_location?: string;
  contact: UserContact;
  favorite_ad_ids: string[];
  watched_ad_ids: string[];
  banned?: boolean;
  reputation: UserReputation;
  is_verified?: boolean;
  last_seen?: string;
  // Referral System
  referral_code: string;
  referred_by?: string;
  available_feature_rewards: number;
  pending_referral_reward?: boolean;
  web_authn_credential_id?: string;
}

export interface Category {
  id:string;
  name: string;
  subcategories: string[];
}

export interface Province {
    id: string;
    name: string;
}

export enum AIAssistantMode {
  SEARCH = 'search',
  AD_CREATION = 'ad_creation',
  NONE = 'none'
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

interface BaseChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  timestamp: string;
  status: MessageStatus;
  is_sending?: boolean;
}

export interface TextChatMessage extends BaseChatMessage {
  type: 'text';
  text: string;
}

export interface AdLinkDetails {
  ad_id: string;
  title: string;
  price: string;
  image: string;
}

export interface AdLinkChatMessage extends BaseChatMessage {
  type: 'ad_link';
  ad_details: AdLinkDetails;
}

export interface DealMemoChatMessage extends BaseChatMessage {
  type: 'deal_memo';
  memo: DealMemo;
}

export type ChatMessage = TextChatMessage | AdLinkChatMessage | DealMemoChatMessage;

export interface ChatMessageDbRow {
    id: string;
    conversation_id: string;
    sender_id: string;
    timestamp: string;
    status: MessageStatus;
    is_sending?: boolean;
    type: 'text' | 'ad_link' | 'deal_memo';
    text?: string | null;
    ad_details?: AdLinkDetails | null;
    memo?: DealMemo | null;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface ChatConversation {
  id: string;
  participant_ids: string[];
  last_message: any; // Using any to break circular dependency that causes TS compiler errors
}

export interface Review {
  id: string;
  ad_id: string;
  reviewer_id: string;
  seller_id: string;
  rating: number; // 1 to 5
  comment: string;
  timestamp: string;
}

export interface ExternalAd {
    id: string;
    company_name: string;
    image_url: string;
    target_url: string;
    is_active: boolean;
}

export type AnnouncementType = 'info' | 'warning' | 'offer';

export interface AppSettings {
    id: number;
    google_ads_enabled: boolean;
    featured_ad_price: number;
    announcement_text: string;
    announcement_type: AnnouncementType;
    is_announcement_active: boolean;
    maintenance_mode: boolean;
    charity_program_description: string;
    small_projects_program_description: string;
}

export type NotificationType = 
  | 'new_message' 
  | 'new_review' 
  | 'ad_approved' 
  | 'ad_rejected' 
  | 'welcome'
  | 'auction_won'
  | 'auction_outbid'
  | 'new_offer'
  | 'watched_ad_price_change'
  | 'new_ad_for_stock_watch'
  | 'new_rfq_offer'
  | 'suspicious_activity'
  | 'referral_reward';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  text: string;
  link: string; // Path to navigate to
  is_read: boolean;
  timestamp: string;
  related_id?: string; // e.g., conversationId or adId
}

export type ToastType = 'success' | 'error';
export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

export interface RequestForQuotation {
  id: string;
  user_id: string;
  product_name: string;
  category: string;
  quantity: number;
  details: string;
  province: string;
  timestamp: string;
  status: 'open' | 'closed';
}

export interface Offer {
  id: string;
  rfq_id: string;
  seller_id: string;
  price_per_unit: number;
  comments: string;
  timestamp: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
}

// --- Auctions & Offers ---
export interface Bid {
  user_id: string;
  amount: number;
  timestamp: string;
}

export interface Auction {
  id: string;
  ad_id: string;
  start_time: string;
  end_time: string;
  start_price: number;
  current_price: number;
  bids: Bid[];
  status: 'active' | 'ended';
  winner_id?: string;
}

export interface PersonalizedOffer {
    id: string;
    ad_id: string;
    seller_id: string;
    discount_percentage: number;
    timestamp: string;
}

export interface MarketBrief {
    id: string;
    date: string;
    content: string;
}

export interface MarketAnalysis {
    price_index: string;
    emerging_opportunities: string;
    competitor_analysis: string;
}

export type ProfileTab = 'favorites' | 'myAds' | 'reviews' | 'settings' | 'watched' | 'stockWatch' | 'myRfqs' | 'myBids';

// --- Admin Panel Specific Types ---
export type SystemHealthStatus = 'operational' | 'degraded' | 'outage';

export interface SystemHealth {
    api_status: SystemHealthStatus;
    database_status: SystemHealthStatus;
    ai_service_status: SystemHealthStatus;
}

export interface SuspiciousActivity {
    id: string;
    description: string;
    related_user_id?: string;
    related_ad_id?: string;
    timestamp: string;
    priority: 'low' | 'medium' | 'high';
}

// --- World-Class Features ---
export interface Opportunity {
  id: string;
  user_id: string;
  type: 'rfq_match' | 'ad_match';
  title: string;
  description: string;
  related_id: string; // Ad ID or RFQ ID
  timestamp: string;
}

export interface DealMemo {
  id: string;
  conversation_id: string;
  product: string;
  quantity: string;
  price: string;
  terms: string;
  status: 'pending' | 'approved' | 'rejected';
  approver_ids: string[];
  timestamp: string;
  smart_payment_id?: string;
}

export interface OrderEvent {
  timestamp: string;
  status: SmartPayment['status'];
  description: string;
}

export interface SmartPayment {
  id: string;
  memo_id: string;
  amount: number;
  status: 'pending_deposit' | 'funds_deposited' | 'shipped' | 'completed' | 'disputed';
  buyer_id: string;
  seller_id: string;
  shipping_info?: ShippingInfo;
  order_history: OrderEvent[];
  dispute_reason?: string;
}


export interface NegotiationMessage {
    id: string;
    sender: 'bot' | 'seller';
    text: string;
    timestamp: string;
}
export interface NegotiationSession {
    id: string;
    ad_id: string;
    buyer_id: string;
    seller_id: string;
    status: 'active' | 'accepted' | 'rejected' | 'cancelled';
    history: NegotiationMessage[];
    // Buyer's private parameters
    target_price: number;
    lowest_price: number;
}

export interface PartnershipScore {
  score: number;
  analysis: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  details: Json;
  type: string;
  is_active_for_features: boolean;
  is_active_for_donations: boolean;
  created_at: string;
}

export interface Campaign {
  id: string;
  title: string;
  description:string;
  image_url: string;
  goal_amount: number;
  current_amount: number;
  donors: number;
  is_active: boolean;
}

export interface AppState {
    users: User[];
    ads: Ad[];
    categories: Category[];
    provinces: Province[];
    settings: AppSettings;
    reviews: Review[];
    notifications: Notification[];
    rfqs: RequestForQuotation[];
    offers: Offer[];
    featureFlags: FeatureFlag[];
    auctions: Auction[];
    personalizedOffers: PersonalizedOffer[];
    stockWatches: StockWatch[];
    marketBriefs: MarketBrief[];
    systemHealth: SystemHealth;
    suspiciousActivities: SuspiciousActivity[];
    opportunities: Opportunity[];
    dealMemos: DealMemo[];
    smartPayments: SmartPayment[];
    negotiationSessions: NegotiationSession[];
    conversations: ChatConversation[];
    messages: ChatMessageDbRow[];
    externalAds: ExternalAd[];
    campaigns: Campaign[];
}
