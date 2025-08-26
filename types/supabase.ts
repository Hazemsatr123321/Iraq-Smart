import { Ad, User, Category, Province, Review, Notification, RequestForQuotation, Offer, FeatureFlag, Auction, PersonalizedOffer, StockWatch, MarketBrief, SystemHealth, SuspiciousActivity, Opportunity, DealMemo, SmartPayment, NegotiationSession, ChatConversation, ChatMessageDbRow, ExternalAd, Campaign } from '../types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ads: {
        Row: Ad;
        Insert: Omit<Ad, 'id' | 'views' | 'saves'>;
        Update: Partial<Ad>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id'>;
        Update: Partial<User>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id'>;
        Update: Partial<Category>;
      };
      provinces: {
        Row: Province;
        Insert: Omit<Province, 'id'>;
        Update: Partial<Province>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id'>;
        Update: Partial<Review>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id'>;
        Update: Partial<Notification>;
      };
      rfqs: {
        Row: RequestForQuotation;
        Insert: Omit<RequestForQuotation, 'id'>;
        Update: Partial<RequestForQuotation>;
      };
      offers: {
        Row: Offer;
        Insert: Omit<Offer, 'id'>;
        Update: Partial<Offer>;
      };
      feature_flags: {
        Row: FeatureFlag;
        Insert: Omit<FeatureFlag, 'id'>;
        Update: Partial<FeatureFlag>;
      };
      auctions: {
        Row: Auction;
        Insert: Omit<Auction, 'id'>;
        Update: Partial<Auction>;
      };
      personalized_offers: {
        Row: PersonalizedOffer;
        Insert: Omit<PersonalizedOffer, 'id'>;
        Update: Partial<PersonalizedOffer>;
      };
      stock_watches: {
        Row: StockWatch;
        Insert: Omit<StockWatch, 'id'>;
        Update: Partial<StockWatch>;
      };
      market_briefs: {
        Row: MarketBrief;
        Insert: Omit<MarketBrief, 'id'>;
        Update: Partial<MarketBrief>;
      };
      system_health: {
        Row: SystemHealth;
        Insert: SystemHealth;
        Update: Partial<SystemHealth>;
      };
      suspicious_activities: {
        Row: SuspiciousActivity;
        Insert: Omit<SuspiciousActivity, 'id'>;
        Update: Partial<SuspiciousActivity>;
      };
      opportunities: {
        Row: Opportunity;
        Insert: Omit<Opportunity, 'id'>;
        Update: Partial<Opportunity>;
      };
      deal_memos: {
        Row: DealMemo;
        Insert: Omit<DealMemo, 'id'>;
        Update: Partial<DealMemo>;
      };
      smart_payments: {
        Row: SmartPayment;
        Insert: Omit<SmartPayment, 'id'>;
        Update: Partial<SmartPayment>;
      };
      negotiation_sessions: {
        Row: NegotiationSession;
        Insert: Omit<NegotiationSession, 'id'>;
        Update: Partial<NegotiationSession>;
      };
      conversations: {
        Row: ChatConversation;
        Insert: Omit<ChatConversation, 'id'>;
        Update: Partial<ChatConversation>;
      };
      messages: {
        Row: ChatMessageDbRow;
        Insert: Omit<ChatMessageDbRow, 'id'>;
        Update: Partial<ChatMessageDbRow>;
      };
      external_ads: {
        Row: ExternalAd;
        Insert: Omit<ExternalAd, 'id'>;
        Update: Partial<ExternalAd>;
      };
      campaigns: {
        Row: Campaign;
        Insert: Omit<Campaign, 'id'>;
        Update: Partial<Campaign>;
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}
