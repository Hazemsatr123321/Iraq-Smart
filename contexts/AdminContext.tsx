

import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import type { User, Ad, ExternalAd, AppSettings, UserRole, Category, Province, Review, Notification, RequestForQuotation, Offer, FeatureFlag, Auction, Bid, PersonalizedOffer, StockWatch, MarketBrief, SystemHealth, SuspiciousActivity, Opportunity, DealMemo, SmartPayment, NegotiationSession, OrderEvent, NegotiationMessage, ChatConversation, ChatMessage, FlashDeal, Campaign, ChatMessageDbRow } from '../types';
import { supabase } from '../services/supabaseClient';
import { ConnectionStatus } from '../components/common/ConnectionStatusIndicator';
import { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];

interface AppState {
  users: Tables['users']['Row'][];
  ads: Tables['ads']['Row'][];
  externalAds: Tables['external_ads']['Row'][];
  settings: AppSettings | null;
  categories: Tables['categories']['Row'][];
  provinces: Tables['provinces']['Row'][];
  reviews: Tables['reviews']['Row'][];
  notifications: Tables['notifications']['Row'][];
  rfqs: Tables['rfqs']['Row'][];
  offers: Tables['offers']['Row'][];
  featureFlags: Tables['feature_flags']['Row'][];
  auctions: Tables['auctions']['Row'][];
  personalizedOffers: Tables['personalized_offers']['Row'][];
  stockWatches: Tables['stock_watches']['Row'][];
  marketBriefs: Tables['market_briefs']['Row'][];
  systemHealth: SystemHealth;
  suspiciousActivities: Tables['suspicious_activities']['Row'][];
  opportunities: Tables['opportunities']['Row'][];
  dealMemos: Tables['deal_memos']['Row'][];
  smartPayments: Tables['smart_payments']['Row'][];
  negotiationSessions: Tables['negotiation_sessions']['Row'][];
  conversations: Tables['conversations']['Row'][];
  messages: Tables['messages']['Row'][];
  campaigns: Tables['campaigns']['Row'][];
}

interface AdminContextType extends AppState {
  settings: AppSettings;
  isDataLoaded: boolean;
  addNewMessage: (message: ChatMessageDbRow) => void;
  addAd: (newAd: Tables['ads']['Insert'], userId: string) => Promise<Tables['ads']['Row']>;
  updateAd: (adId: string, updatedData: Tables['ads']['Update']) => Promise<void>;
  deleteAd: (adId: string) => Promise<void>;
  toggleAdFeature: (adId: string) => Promise<void>;
  updateAdStatus: (adId: string, status: 'approved' | 'rejected', rejectionReason?: string) => Promise<void>;
  createAuction: (adId: string, startPrice: number, durationHours: number) => Promise<void>;
  trackAdView: (adId: string) => Promise<void>; 
  updateAdSaves: (adId: string, isFavoriting: boolean) => Promise<void>;
  createFlashDeal: (adId: string, dealPrice: string, durationHours: number) => Promise<void>;
  createPersonalizedOffer: (adId: string, discountPercentage: number, sellerId: string) => Promise<void>;
  endFlashDeal: (adId: string) => Promise<void>;
  createStockWatch: (watchData: Omit<StockWatch, 'id' | 'user_id'>, userId: string) => Promise<void>;
  getStockWatchesForUser: (userId: string) => StockWatch[];
  deleteStockWatch: (watchId: string) => Promise<void>;
  featureAdForFree: (adId: string) => Promise<void>;
  updateUser: (userId: string, updatedData: Tables['users']['Update']) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  toggleUserBan: (userId: string) => Promise<void>;
  toggleUserVerification: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addUser: (user: Tables['users']['Insert']) => Promise<Tables['users']['Row']>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  addExternalAd: (ad: Omit<ExternalAd, 'id'>) => Promise<void>;
  updateExternalAd: (ad: ExternalAd) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (categoryId: string, name: string) => Promise<void>;
  deleteSubcategory: (categoryId: string, name: string) => Promise<void>;
  addProvince: (name: string) => Promise<void>;
  deleteProvince: (id: string) => Promise<void>;
  getReviewsForSeller: (sellerId: string) => Review[];
  deleteReview: (reviewId: string) => Promise<void>;
  calculateAverageRating: (sellerId: string) => { average: number; count: number };
  addReview: (reviewData: Omit<Review, 'id'|'timestamp'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  clearAllNotifications: (userId: string) => Promise<void>;
  createNotification: (notification: Tables['notifications']['Insert']) => Promise<void>;
  unreadNotificationCount: (userId: string) => number;
  toggleFeatureFlag: (featureId: string) => Promise<void>;
  stats: any;
  getPricingAnalysis: (productName: string, userId: string) => { myPrice: number | null; competitorPrices: number[] };
  getDemandHotspots: () => Promise<{ province: string; count: number }[]>;
  getProductOpportunities: () => Promise<{ productName: string; demand: number; supply: number }[]>;
  getOpportunitiesForUser: (user: User) => Opportunity[];
  getAuctionById: (auctionId: string) => Auction | undefined;
  placeBid: (auctionId: string, amount: number, userId: string) => Promise<void>;
  addRfq: (rfqData: Omit<RequestForQuotation, 'id' | 'user_id' | 'timestamp' | 'status'>, userId: string) => Promise<void>;
  addOfferToRfq: (offerData: Omit<Offer, 'id' | 'seller_id' | 'timestamp'>, sellerId: string) => Promise<void>;
  getOffersForRfq: (rfqId: string) => Offer[];
  addMarketBrief: (brief: Omit<MarketBrief, 'id'>) => Promise<void>;
  addDealMemo: (conversationId: string, dealDetails: Omit<DealMemo, 'id'|'conversation_id'|'status'|'approver_ids'|'timestamp'>, creatorId: string) => Promise<DealMemo>;
  updateDealMemo: (memoId: string, updatedData: Partial<Omit<DealMemo, 'id'>>) => Promise<void>;
  scanForSuspiciousActivity: () => Promise<void>;
  getSmartPaymentByMemoId: (memoId: string) => SmartPayment | undefined;
  initiateSmartPayment: (memoId: string, buyerId: string, sellerId: string, amount: number) => Promise<SmartPayment>;
  updateSmartPaymentStatus: (paymentId: string, status: SmartPayment['status'], description?: string) => Promise<void>;
  addShippingInfoToPayment: (paymentId: string, shippingInfo: { company: string; tracking_number: string; }) => Promise<void>;
  raiseDispute: (paymentId: string, reason: string) => Promise<void>;
  resolveDispute: (paymentId: string, resolution: 'refund' | 'payout') => Promise<void>;
  calculatePartnershipScore: (userId1: string, userId2: string) => Promise<{ dealCount: number; avgRating: number; }>;
  grantReferralReward: (userId: string) => Promise<void>;
  applyFreeFeature: (adId: string, userId: string) => Promise<void>;
  addNegotiationSession: (sessionData: Omit<NegotiationSession, 'id'>) => Promise<NegotiationSession>;
  addNegotiationMessage: (sessionId: string, message: NegotiationMessage) => Promise<void>;
  addConversation: (conversationData: Tables['conversations']['Insert']) => Promise<Tables['conversations']['Row']>;
  addMessage: (messageData: Tables['messages']['Insert']) => Promise<Tables['messages']['Row']>;
  updateConversationLastMessage: (conversationId: string, message: ChatMessage) => Promise<void>;
  connectionStatus: ConnectionStatus;
  retryConnection: () => void;
  loadAds: (options: { page: number, limit: number }) => Promise<Ad[]>;
  getAdById: (adId: string) => Ad | undefined;
  loadAdById: (adId: string) => Promise<Ad | null>;
  loadUserById: (userId: string) => Promise<User | null>;
  loadFeaturedContent: () => Promise<void>;
  loadReviewsForSeller: (sellerId: string) => Promise<void>;
  loadUserContent: (userId: string) => Promise<void>;
  addDonationToCampaign: (campaignId: string, amount: number) => Promise<void>;
  addCampaign: (campaignData: Omit<Campaign, 'id' | 'current_amount' | 'donors' | 'is_active'>) => Promise<Campaign>;
  updateCampaign: (campaignId: string, updatedData: Partial<Omit<Campaign, 'id'>>) => Promise<void>;
  deleteCampaign: (campaignId: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [ads, setAds] = useState<Ad[]>([]);
    const [externalAds, setExternalAds] = useState<ExternalAd[]>([]);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [rfqs, setRfqs] = useState<RequestForQuotation[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [personalizedOffers, setPersonalizedOffers] = useState<PersonalizedOffer[]>([]);
    const [stockWatches, setStockWatches] = useState<StockWatch[]>([]);
    const [marketBriefs, setMarketBriefs] = useState<MarketBrief[]>([]);
    const [systemHealth, setSystemHealth] = useState<SystemHealth>({ api_status: 'operational', database_status: 'operational', ai_service_status: 'operational' });
    const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [dealMemos, setDealMemos] = useState<DealMemo[]>([]);
    const [smartPayments, setSmartPayments] = useState<SmartPayment[]>([]);
    const [negotiationSessions, setNegotiationSessions] = useState<NegotiationSession[]>([]);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [messages, setMessages] = useState<ChatMessageDbRow[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    const addNewMessage = (message: ChatMessageDbRow) => {
        setMessages(prev => [...prev, message]);
    };

    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');

    const fetchData = useCallback(async () => {
        try {
            setConnectionStatus('online');
            setIsDataLoaded(false);
            const [
                adsRes, usersRes, categoriesRes, provincesRes, settingsRes,
                reviewsRes, notificationsRes, rfqsRes, offersRes, featureFlagsRes,
                auctionsRes, personalizedOffersRes, stockWatchesRes, marketBriefsRes,
                suspiciousActivitiesRes, opportunitiesRes, dealMemosRes, smartPaymentsRes,
                negotiationSessionsRes, conversationsRes, messagesRes, externalAdsRes, campaignsRes
            ] = await Promise.all([
                supabase.from('ads').select('*'),
                supabase.from('users').select('*'),
                supabase.from('categories').select('*'),
                supabase.from('provinces').select('*'),
                supabase.from('settings').select('*').single(),
                supabase.from('reviews').select('*'),
                supabase.from('notifications').select('*'),
                supabase.from('rfqs').select('*'),
                supabase.from('offers').select('*'),
                supabase.from('feature_flags').select('*'),
                supabase.from('auctions').select('*'),
                supabase.from('personalized_offers').select('*'),
                supabase.from('stock_watches').select('*'),
                supabase.from('market_briefs').select('*'),
                supabase.from('suspicious_activities').select('*'),
                supabase.from('opportunities').select('*'),
                supabase.from('deal_memos').select('*'),
                supabase.from('smart_payments').select('*'),
                supabase.from('negotiation_sessions').select('*'),
                supabase.from('conversations').select('*'),
                supabase.from('messages').select('*'),
                supabase.from('external_ads').select('*'),
                supabase.from('campaigns').select('*'),
            ]);

            if (adsRes.data) setAds(adsRes.data as Ad[]);
            if (usersRes.data) setUsers(usersRes.data as User[]);
            if (categoriesRes.data) setCategories(categoriesRes.data as Category[]);
            if (provincesRes.data) setProvinces(provincesRes.data as Province[]);
            if (settingsRes.data) setSettings(settingsRes.data as AppSettings);
            if (reviewsRes.data) setReviews(reviewsRes.data as Review[]);
            if (notificationsRes.data) setNotifications(notificationsRes.data as Notification[]);
            if (rfqsRes.data) setRfqs(rfqsRes.data as RequestForQuotation[]);
            if (offersRes.data) setOffers(offersRes.data as Offer[]);
            if (featureFlagsRes.data) setFeatureFlags(featureFlagsRes.data as FeatureFlag[]);
            if (auctionsRes.data) setAuctions(auctionsRes.data as Auction[]);
            if (personalizedOffersRes.data) setPersonalizedOffers(personalizedOffersRes.data as PersonalizedOffer[]);
            if (stockWatchesRes.data) setStockWatches(stockWatchesRes.data as StockWatch[]);
            if (marketBriefsRes.data) setMarketBriefs(marketBriefsRes.data as MarketBrief[]);
            if (suspiciousActivitiesRes.data) setSuspiciousActivities(suspiciousActivitiesRes.data as SuspiciousActivity[]);
            if (opportunitiesRes.data) setOpportunities(opportunitiesRes.data as Opportunity[]);
            if (dealMemosRes.data) setDealMemos(dealMemosRes.data as DealMemo[]);
            if (smartPaymentsRes.data) setSmartPayments(smartPaymentsRes.data as SmartPayment[]);
            if (negotiationSessionsRes.data) setNegotiationSessions(negotiationSessionsRes.data as NegotiationSession[]);
            if (conversationsRes.data) setConversations(conversationsRes.data as ChatConversation[]);
            if (messagesRes.data) setMessages(messagesRes.data as ChatMessageDbRow[]);
            if (externalAdsRes.data) setExternalAds(externalAdsRes.data as ExternalAd[]);
            if (campaignsRes.data) setCampaigns(campaignsRes.data as Campaign[]);

            setIsDataLoaded(true);
        } catch (error) {
            console.error('Error loading data:', error);
            setConnectionStatus('offline');
            setIsDataLoaded(true); // Still allow app to run with empty/stale data
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'is_read'>) => {
        const { data, error } = await supabase.from('notifications').insert(notification).select().single();
        if (error) {
            console.error('Error creating notification:', error);
            return;
        }
        if (data) {
            setNotifications(prev => [...prev, data as Notification]);
        }
    }, []);

    const addAd = async (newAdData: Omit<Ad, 'id' | 'user_id' | 'featured' | 'status' | 'views' | 'saves'>, userId: string): Promise<Ad> => {
        const adToInsert = {
            ...newAdData,
            user_id: userId,
            status: 'pending' as const,
            featured: false,
            views: 0,
            saves: 0,
        };
        const { data, error } = await supabase.from('ads').insert(adToInsert).select().single();
        if (error) {
            console.error('Error adding ad:', error);
            throw error;
        }
        setAds(prev => [...prev, data as Ad]);

        // Check for suspicious activity
        const { error: rpcError } = await supabase.rpc('check_suspicious_ad_posting', { user_id_param: userId });
        if (rpcError) {
            console.error('Error checking for suspicious activity:', rpcError);
        }

        return data as Ad;
    };
    
    const updateAd = async (adId: string, updatedData: Partial<Omit<Ad, 'id'>>) => {
        const { data, error } = await supabase.from('ads').update(updatedData).eq('id', adId).select().single();
        if (error) {
            console.error('Error updating ad:', error);
            throw error;
        }
        setAds(prev => prev.map(ad => ad.id === adId ? data as Ad : ad));
    };
    
    const deleteAd = async (adId: string) => {
        const { error } = await supabase.from('ads').delete().eq('id', adId);
        if (error) {
            console.error('Error deleting ad:', error);
            throw error;
        }
        setAds(prev => prev.filter(ad => ad.id !== adId));
    };

    const trackAdView = async (adId: string) => {
        const { error } = await supabase.rpc('increment_ad_views', { ad_id_param: adId });
        if (error) console.error('Error tracking ad view:', error);
        else setAds(prev => prev.map(ad => ad.id === adId ? { ...ad, views: (ad.views || 0) + 1 } : ad));
    };

    const updateAdSaves = async (adId: string, isFavoriting: boolean) => {
        const { error } = await supabase.rpc('update_ad_saves', { ad_id_param: adId, increment: isFavoriting });
        if (error) console.error('Error updating ad saves:', error);
        else setAds(prev => prev.map(ad => ad.id === adId ? { ...ad, saves: (ad.saves || 0) + (isFavoriting ? 1 : -1) } : ad));
    };
    
    const updateAdStatus = async (adId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
        const { data: updatedAd, error } = await supabase.from('ads').update({ status, rejection_reason: rejectionReason }).eq('id', adId).select().single();
        if (error) {
            console.error('Error updating ad status:', error);
            return;
        }
        setAds(prev => prev.map(ad => ad.id === adId ? updatedAd as Ad : ad));

        if (updatedAd) {
            await createNotification({
                user_id: updatedAd.user_id,
                type: status === 'approved' ? 'ad_approved' : 'ad_rejected',
                text: status === 'approved' ? `تمت الموافقة على إعلانك: "${updatedAd.title}"` : `تم رفض إعلانك: "${updatedAd.title}"`,
                link: `/ad/${updatedAd.id}`,
                related_id: updatedAd.id,
            });
        }
    };
    
    const addUser = async (userData: Omit<User, 'id'>): Promise<User> => {
        const { data, error } = await supabase.from('users').insert(userData).select().single();
        if (error) {
            console.error('Error adding user:', error);
            throw error;
        }
        setUsers(prev => [...prev, data as User]);
        return data as User;
    };
    
    const updateUser = async (userId: string, updatedData: Partial<Omit<User, 'id'>>) => {
        const { data, error } = await supabase.from('users').update(updatedData).eq('id', userId).select().single();
        if (error) {
            console.error('Error updating user:', error);
            throw error;
        }
        setUsers(prev => prev.map(u => u.id === userId ? data as User : u));
    };

    const addMessage = async (messageData: Omit<ChatMessageDbRow, 'id' | 'timestamp'>): Promise<ChatMessageDbRow> => {
        const { data, error } = await supabase.from('messages').insert(messageData).select().single();
        if (error) {
            console.error('Error adding message:', error);
            throw error;
        }
        setMessages(prev => [...prev, data as ChatMessageDbRow]);
        return data as ChatMessageDbRow;
    };

    const updateConversationLastMessage = async (conversationId: string, message: ChatMessage) => {
        const { error } = await supabase.from('conversations').update({ last_message: message as any }).eq('id', conversationId);
        if (error) console.error('Error updating conversation:', error);
        else setConversations(prev => prev.map(c => c.id === conversationId ? {...c, last_message: message} : c));
    };

    const addConversation = async (conversationData: Omit<ChatConversation, 'id'>): Promise<ChatConversation> => {
        const { data, error } = await supabase.from('conversations').insert(conversationData).select().single();
        if (error) {
            console.error('Error adding conversation:', error);
            throw error;
        }
        setConversations(prev => [...prev, data as ChatConversation]);
        return data as ChatConversation;
    };

    const contextValue: AdminContextType = useMemo(() => ({
        users, ads, externalAds, settings: settings!, categories, provinces, reviews, notifications,
        rfqs, offers, featureFlags, auctions, personalizedOffers, stockWatches, marketBriefs,
        systemHealth, suspiciousActivities, opportunities, dealMemos, smartPayments, negotiationSessions,
        conversations, messages, campaigns,
        isDataLoaded,
        connectionStatus,
        retryConnection: fetchData,
        addNewMessage,
        addAd,
        updateAd,
        deleteAd,
        trackAdView,
        updateAdSaves,
        updateAdStatus,
        addUser,
        updateUser,
        addMessage,
        addConversation,
        updateConversationLastMessage,
        createNotification,
        // Mocked or simplified implementations for other functions
        toggleAdFeature: async (adId: string) => {
            const ad = ads.find(a => a.id === adId);
            if(ad) await updateAd(adId, { featured: !ad.featured });
        },
        createAuction: async (adId: string, startPrice: number, durationHours: number) => {
            const endTime = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();
            const { data, error } = await supabase.from('auctions').insert({
                ad_id: adId,
                start_price: startPrice,
                current_price: startPrice,
                start_time: new Date().toISOString(),
                end_time: endTime,
                status: 'active',
                bids: [],
            }).select().single();

            if (error) {
                console.error('Error creating auction:', error);
                throw error;
            }
            if (data) {
                await updateAd(adId, { auction_id: data.id });
                setAuctions(prev => [...prev, data as Auction]);
            }
        },
        placeBid: async (auctionId, amount, userId) => {
            const { error } = await supabase.rpc('place_bid', {
                p_auction_id: auctionId,
                p_bid_amount: amount,
                p_bidder_id: userId
            });

            if (error) {
                console.error('Error placing bid:', error);
                throw error;
            }
            // Manually update the local state to reflect the new bid
            setAuctions(prev => prev.map(auction => {
                if (auction.id === auctionId) {
                    const newBids = [...(auction.bids || []), { user_id: userId, amount, timestamp: new Date().toISOString() }];
                    return { ...auction, bids: newBids, current_price: amount };
                }
                return auction;
            }));
        },
        stats: {
            userCount: users.length,
            adCount: ads.length,
            pendingAdCount: ads.filter(a => a.status === 'pending').length,
            reviewCount: reviews.length,
        },
        getAdById: (adId) => ads.find(a => a.id === adId),
        loadAds: async (options) => { return ads; }, // Simplified, could add pagination
        loadAdById: async (adId) => {
            const ad = ads.find(a => a.id === adId);
            if (ad) return ad;
            const { data } = await supabase.from('ads').select('*').eq('id', adId).single();
            if (data) setAds(prev => [...prev.filter(a => a.id !== adId), data as Ad]);
            return data as Ad | null;
        },
        loadUserById: async (userId) => {
            const user = users.find(u => u.id === userId);
            if (user) return user;
            const { data } = await supabase.from('users').select('*').eq('id', userId).single();
            if (data) setUsers(prev => [...prev.filter(u => u.id !== userId), data as User]);
            return data as User | null;
        },
        loadFeaturedContent: async () => {},
        loadReviewsForSeller: async () => {},
        loadUserContent: async () => {},
        // --- Placeholder functions to satisfy the interface ---
        createFlashDeal: async (adId, dealPrice, durationHours) => {
            const endTime = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();
            const flashDeal: FlashDeal = { is_active: true, deal_price: dealPrice, end_time: endTime };
            await updateAd(adId, { flash_deal: flashDeal });
        },
        createPersonalizedOffer: async (adId, discountPercentage, sellerId) => {
            const { data, error } = await supabase.from('personalized_offers').insert({ ad_id: adId, discount_percentage: discountPercentage, seller_id: sellerId }).select().single();
            if (error) throw error;
            if (data) setPersonalizedOffers(prev => [...prev, data as PersonalizedOffer]);
        },
        endFlashDeal: async (adId) => {
            const ad = ads.find(a => a.id === adId);
            if (ad && ad.flash_deal) {
                const flashDeal: FlashDeal = { ...ad.flash_deal, is_active: false };
                await updateAd(adId, { flash_deal: flashDeal });
            }
        },
        createStockWatch: async (watchData, userId) => {
            const { data, error } = await supabase.from('stock_watches').insert({ ...watchData, user_id: userId }).select().single();
            if (error) throw error;
            if (data) setStockWatches(prev => [...prev, data as StockWatch]);
        },
        getStockWatchesForUser: (userId: string) => stockWatches.filter(sw => sw.user_id === userId),
        deleteStockWatch: async (watchId) => {
            const { error } = await supabase.from('stock_watches').delete().eq('id', watchId);
            if (error) throw error;
            setStockWatches(prev => prev.filter(sw => sw.id !== watchId));
        },
        featureAdForFree: async (adId) => {
            await updateAd(adId, { featured: true });
        },
        updateUserRole: async (userId, role) => { await updateUser(userId, { role }) },
        toggleUserBan: async (userId) => {
            const user = users.find(u => u.id === userId);
            if (user) await updateUser(userId, { banned: !user.banned });
        },
        toggleUserVerification: async (userId) => {
            const user = users.find(u => u.id === userId);
            if (user) await updateUser(userId, { is_verified: !user.is_verified });
        },
        deleteUser: async (userId) => {
            const { error } = await supabase.from('users').delete().eq('id', userId);
            if (error) throw error;
            setUsers(prev => prev.filter(u => u.id !== userId));
        },
        updateSettings: async (newSettings) => {
            const { data, error } = await supabase.from('settings').update(newSettings).eq('id', 1).single();
            if (error) {
                console.error('Error updating settings:', error);
                throw error;
            }
            if(data) setSettings(data as AppSettings);
        },
        addExternalAd: async (ad) => {
            const { data, error } = await supabase.from('external_ads').insert(ad).select().single();
            if (error) throw error;
            if (data) setExternalAds(prev => [...prev, data as ExternalAd]);
        },
        updateExternalAd: async (ad) => {
            const { data, error } = await supabase.from('external_ads').update(ad).eq('id', ad.id).select().single();
            if (error) throw error;
            if (data) setExternalAds(prev => prev.map(a => a.id === ad.id ? data as ExternalAd : a));
        },
        addCategory: async (name) => {
            const { data, error } = await supabase.from('categories').insert({ name, subcategories: [] }).select().single();
            if (error) throw error;
            if (data) setCategories(prev => [...prev, data as Category]);
        },
        deleteCategory: async (id) => {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            setCategories(prev => prev.filter(c => c.id !== id));
        },
        addSubcategory: async (categoryId, name) => {
            const category = categories.find(c => c.id === categoryId);
            if (!category) return;
            const newSubcategories = [...category.subcategories, name];
            const { data, error } = await supabase.from('categories').update({ subcategories: newSubcategories }).eq('id', categoryId).select().single();
            if (error) throw error;
            if (data) setCategories(prev => prev.map(c => c.id === categoryId ? data as Category : c));
        },
        deleteSubcategory: async (categoryId, name) => {
            const category = categories.find(c => c.id === categoryId);
            if (!category) return;
            const newSubcategories = category.subcategories.filter(s => s !== name);
            const { data, error } = await supabase.from('categories').update({ subcategories: newSubcategories }).eq('id', categoryId).select().single();
            if (error) throw error;
            if (data) setCategories(prev => prev.map(c => c.id === categoryId ? data as Category : c));
        },
        addProvince: async (name) => {
            const { data, error } = await supabase.from('provinces').insert({ name }).select().single();
            if (error) throw error;
            if (data) setProvinces(prev => [...prev, data as Province]);
        },
        deleteProvince: async (id) => {
            const { error } = await supabase.from('provinces').delete().eq('id', id);
            if (error) throw error;
            setProvinces(prev => prev.filter(p => p.id !== id));
        },
        getReviewsForSeller: (sellerId) => reviews.filter(r => r.seller_id === sellerId),
        deleteReview: async (reviewId) => {
            const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
            if (error) throw error;
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        },
        calculateAverageRating: (sellerId: string) => {
            const relevantReviews = reviews.filter(r => r.seller_id === sellerId);
            if (relevantReviews.length === 0) return { average: 0, count: 0 };
            const sum = relevantReviews.reduce((acc, r) => acc + r.rating, 0);
            return { average: sum / relevantReviews.length, count: relevantReviews.length };
        },
        addReview: async (reviewData) => {
            const { data, error } = await supabase.from('reviews').insert(reviewData).select().single();
            if (error) throw error;
            if (data) setReviews(prev => [...prev, data as Review]);
        },
        markAsRead: async (notificationId) => {
            const { data, error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId).select().single();
            if (error) throw error;
            if (data) setNotifications(prev => prev.map(n => n.id === notificationId ? data as Notification : n));
        },
        markAllAsRead: async (userId) => {
            const { data, error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).select();
            if (error) throw error;
            if (data) setNotifications(prev => prev.map(n => n.user_id === userId ? { ...n, is_read: true } : n));
        },
        clearAllNotifications: async (userId) => {
            const { error } = await supabase.from('notifications').delete().eq('user_id', userId);
            if (error) throw error;
            setNotifications(prev => prev.filter(n => n.user_id !== userId));
        },
        unreadNotificationCount: (userId: string) => notifications.filter(n => n.user_id === userId && !n.is_read).length,
        toggleFeatureFlag: async (featureId) => {
            const flag = featureFlags.find(f => f.id === featureId);
            if (!flag) return;
            const { data, error } = await supabase.from('feature_flags').update({ is_enabled: !flag.is_enabled }).eq('id', featureId).select().single();
            if (error) throw error;
            if (data) setFeatureFlags(prev => prev.map(f => f.id === featureId ? data as FeatureFlag : f));
        },
        getPricingAnalysis: () => ({ myPrice: null, competitorPrices: [] }),
        getDemandHotspots: async () => {
            const { data, error } = await supabase.rpc('get_demand_hotspots');
            if (error) {
                console.error('Error fetching demand hotspots:', error);
                return [];
            }
            return data;
        },
        getProductOpportunities: async () => {
            const { data, error } = await supabase.rpc('get_product_opportunities');
            if (error) {
                console.error('Error fetching product opportunities:', error);
                return [];
            }
            return data;
        },
        getOpportunitiesForUser: () => [],
        getAuctionById: (auctionId: string) => auctions.find(a => a.id === auctionId),
        addRfq: async (rfqData, userId) => {
            const { data, error } = await supabase.from('rfqs').insert({ ...rfqData, user_id: userId, status: 'open' }).select().single();
            if (error) throw error;
            if (data) setRfqs(prev => [...prev, data as RequestForQuotation]);
        },
        addOfferToRfq: async (offerData, sellerId) => {
            const { data, error } = await supabase.from('offers').insert({ ...offerData, seller_id: sellerId }).select().single();
            if (error) throw error;
            if (data) setOffers(prev => [...prev, data as Offer]);
        },
        getOffersForRfq: (rfqId: string) => offers.filter(o => o.rfq_id === rfqId),
        addMarketBrief: async (brief) => {
            const { data, error } = await supabase.from('market_briefs').insert(brief).select().single();
            if (error) throw error;
            if (data) setMarketBriefs(prev => [...prev, data as MarketBrief]);
        },
        addDealMemo: async (conversationId, dealDetails, creatorId) => {
            const { data, error } = await supabase.from('deal_memos').insert({ ...dealDetails, conversation_id: conversationId, status: 'pending', approver_ids: [creatorId] }).select().single();
            if (error) throw error;
            if (data) setDealMemos(prev => [...prev, data as DealMemo]);
            return data as DealMemo;
        },
        updateDealMemo: async (memoId, updatedData) => {
            const { data, error } = await supabase.from('deal_memos').update(updatedData).eq('id', memoId).select().single();
            if (error) throw error;
            if (data) setDealMemos(prev => prev.map(m => m.id === memoId ? data as DealMemo : m));
        },
        scanForSuspiciousActivity: async () => { /* Placeholder for complex logic */ },
        getSmartPaymentByMemoId: (memoId) => smartPayments.find(p => p.memo_id === memoId),
        initiateSmartPayment: async (memoId, buyerId, sellerId, amount) => {
            const { data, error } = await supabase.from('smart_payments').insert({ memo_id: memoId, buyer_id: buyerId, seller_id: sellerId, amount, status: 'pending_deposit', order_history: [] }).select().single();
            if (error) throw error;
            if (data) setSmartPayments(prev => [...prev, data as SmartPayment]);
            return data as SmartPayment;
        },
        updateSmartPaymentStatus: async (paymentId, status, description) => {
            const payment = smartPayments.find(p => p.id === paymentId);
            if (!payment) return;
            const newOrderHistory = [...payment.order_history, { timestamp: new Date().toISOString(), status, description: description || '' }];
            const { data, error } = await supabase.from('smart_payments').update({ status, order_history: newOrderHistory }).eq('id', paymentId).select().single();
            if (error) throw error;
            if (data) setSmartPayments(prev => prev.map(p => p.id === paymentId ? data as SmartPayment : p));
        },
        addShippingInfoToPayment: async (paymentId, shippingInfo) => {
            const { data, error } = await supabase.from('smart_payments').update({ shipping_info: shippingInfo }).eq('id', paymentId).select().single();
            if (error) throw error;
            if (data) setSmartPayments(prev => prev.map(p => p.id === paymentId ? data as SmartPayment : p));
        },
        raiseDispute: async (paymentId, reason) => {
            await updateSmartPaymentStatus(paymentId, 'disputed', `Dispute raised: ${reason}`);
        },
        resolveDispute: async (paymentId, resolution) => {
            await updateSmartPaymentStatus(paymentId, 'completed', `Dispute resolved: ${resolution}`);
        },
        calculatePartnershipScore: async (userId1, userId2) => {
            const { data, error } = await supabase.rpc('calculate_partnership_score', {
                user_id_1: userId1,
                user_id_2: userId2,
            });
            if (error) {
                console.error('Error calculating partnership score:', error);
                return { dealCount: 0, avgRating: 0 };
            }
            return data[0] || { dealCount: 0, avgRating: 0 };
        },
        grantReferralReward: async (userId) => {
            const user = users.find(u => u.id === userId);
            if(user) await updateUser(userId, { available_feature_rewards: (user.available_feature_rewards || 0) + 1 });
        },
        applyFreeFeature: async (adId, userId) => {
            const user = users.find(u => u.id === userId);
            if (user && user.available_feature_rewards > 0) {
                await updateUser(userId, { available_feature_rewards: user.available_feature_rewards - 1 });
                await updateAd(adId, { featured: true });
            }
        },
        addNegotiationSession: async (sessionData) => {
            const { data, error } = await supabase.from('negotiation_sessions').insert(sessionData).select().single();
            if (error) throw error;
            if (data) setNegotiationSessions(prev => [...prev, data as NegotiationSession]);
            return data as NegotiationSession;
        },
        addNegotiationMessage: async (sessionId, message) => {
            const session = negotiationSessions.find(s => s.id === sessionId);
            if (!session) return;
            const newHistory = [...session.history, message];
            const { data, error } = await supabase.from('negotiation_sessions').update({ history: newHistory }).eq('id', sessionId).select().single();
            if (error) throw error;
            if (data) setNegotiationSessions(prev => prev.map(s => s.id === sessionId ? data as NegotiationSession : s));
        },
        addDonationToCampaign: async (campaignId, amount) => {
            const { error } = await supabase.rpc('add_donation', { c_id: campaignId, d_amount: amount });
            if (error) throw error;
            setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, current_amount: c.current_amount + amount, donors: c.donors + 1 } : c));
        },
        addCampaign: async (campaignData) => {
            const { data, error } = await supabase.from('campaigns').insert(campaignData).select().single();
            if (error) throw error;
            if(data) setCampaigns(prev => [...prev, data as Campaign]);
            return data as Campaign;
        },
        updateCampaign: async (campaignId, updatedData) => {
            const { data, error } = await supabase.from('campaigns').update(updatedData).eq('id', campaignId).select().single();
            if (error) throw error;
            if (data) setCampaigns(prev => prev.map(c => c.id === campaignId ? data as Campaign : c));
        },
        deleteCampaign: async (campaignId) => {
            const { error } = await supabase.from('campaigns').delete().eq('id', campaignId);
            if (error) throw error;
            setCampaigns(prev => prev.filter(c => c.id !== campaignId));
        },
    }), [
        users, ads, externalAds, settings, categories, provinces, reviews, notifications,
        rfqs, offers, featureFlags, auctions, personalizedOffers, stockWatches, marketBriefs,
        systemHealth, suspiciousActivities, opportunities, dealMemos, smartPayments, negotiationSessions,
        conversations, messages, campaigns,
        isDataLoaded, connectionStatus, fetchData
    ]);
    
    return (
        <AdminContext.Provider value={contextValue}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within a AdminProvider');
  }
  return context;
};