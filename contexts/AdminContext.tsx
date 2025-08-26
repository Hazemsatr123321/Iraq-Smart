

import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import type { User, Ad, ExternalAd, AppSettings, UserRole, Category, Province, Review, Notification, RequestForQuotation, Offer, FeatureFlag, Auction, Bid, PersonalizedOffer, StockWatch, MarketBrief, SystemHealth, SuspiciousActivity, Opportunity, DealMemo, SmartPayment, NegotiationSession, OrderEvent, NegotiationMessage, ChatConversation, ChatMessage, FlashDeal, Campaign, ChatMessageDbRow } from '../types';
import * as mockData from '../data/mockData';
import { ConnectionStatus } from '../components/common/ConnectionStatusIndicator';

interface AppState {
  users: User[];
  ads: Ad[];
  externalAds: ExternalAd[];
  settings: AppSettings | null;
  categories: Category[];
  provinces: Province[];
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
  campaigns: Campaign[];
}

interface AdminContextType extends Omit<AppState, 'settings'> {
  settings: AppSettings;
  isDataLoaded: boolean;
  addAd: (newAd: Omit<Ad, 'id' | 'user_id' | 'featured' | 'status' | 'views' | 'saves'>, userId: string) => Promise<Ad>;
  updateAd: (adId: string, updatedData: Partial<Omit<Ad, 'id'>>) => Promise<void>;
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
  updateUser: (userId: string, updatedData: Partial<Omit<User, 'id'>>) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  toggleUserBan: (userId: string) => Promise<void>;
  toggleUserVerification: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<User>;
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
  createNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'is_read'>) => Promise<void>;
  unreadNotificationCount: (userId: string) => number;
  toggleFeatureFlag: (featureId: string) => Promise<void>;
  stats: any;
  getPricingAnalysis: (productName: string, userId: string) => { myPrice: number | null; competitorPrices: number[] };
  getDemandHotspots: () => { province: string; count: number }[];
  getProductOpportunities: () => { productName: string; demand: number; supply: number }[];
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
  calculatePartnershipScore: (userId1: string, userId2: string) => { dealCount: number; avgRating: number; };
  grantReferralReward: (userId: string) => Promise<void>;
  applyFreeFeature: (adId: string, userId: string) => Promise<void>;
  addNegotiationSession: (sessionData: Omit<NegotiationSession, 'id'>) => Promise<NegotiationSession>;
  addNegotiationMessage: (sessionId: string, message: NegotiationMessage) => Promise<void>;
  addConversation: (conversationData: Omit<ChatConversation, 'id'>) => Promise<ChatConversation>;
  addMessage: (messageData: Omit<ChatMessageDbRow, 'id' | 'timestamp'>) => Promise<ChatMessageDbRow>;
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
    const [state, setState] = useState<AppState>(mockData.initialState);
    const [isDataLoaded, setIsDataLoaded] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');

    const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'is_read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}`,
            timestamp: new Date().toISOString(),
            is_read: false
        };
        setState(prev => ({ ...prev, notifications: [...prev.notifications, newNotification] }));
    }, []);

    const addAd = async (newAdData: Omit<Ad, 'id' | 'user_id' | 'featured' | 'status' | 'views' | 'saves'>, userId: string): Promise<Ad> => {
        const newAd: Ad = {
            ...newAdData,
            id: `ad-${Date.now()}`,
            user_id: userId,
            status: 'pending',
            featured: false,
            views: 0,
            saves: 0,
        };
        setState(prev => ({ ...prev, ads: [...prev.ads, newAd] }));
        return newAd;
    };
    
    const updateAd = async (adId: string, updatedData: Partial<Omit<Ad, 'id'>>) => {
        setState(prev => ({
            ...prev,
            ads: prev.ads.map(ad => ad.id === adId ? { ...ad, ...updatedData, status: 'pending' } : ad)
        }));
    };
    
    const deleteAd = async (adId: string) => {
        setState(prev => ({ ...prev, ads: prev.ads.filter(ad => ad.id !== adId) }));
    };

    const trackAdView = async (adId: string) => {
        setState(prev => ({
            ...prev,
            ads: prev.ads.map(ad => ad.id === adId ? { ...ad, views: (ad.views || 0) + 1 } : ad)
        }));
    };

    const updateAdSaves = async (adId: string, isFavoriting: boolean) => {
        setState(prev => ({
            ...prev,
            ads: prev.ads.map(ad => ad.id === adId ? { ...ad, saves: (ad.saves || 0) + (isFavoriting ? 1 : -1) } : ad)
        }));
    };
    
    const updateAdStatus = async (adId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
        let adToNotify: Ad | undefined;
        setState(prev => {
            const newAds = prev.ads.map(ad => {
                if (ad.id === adId) {
                    adToNotify = { ...ad, status, rejection_reason: rejectionReason };
                    return adToNotify;
                }
                return ad;
            });
            return { ...prev, ads: newAds };
        });
        if (adToNotify) {
            await createNotification({
                user_id: adToNotify.user_id,
                type: status === 'approved' ? 'ad_approved' : 'ad_rejected',
                text: status === 'approved' ? `تمت الموافقة على إعلانك: "${adToNotify.title}"` : `تم رفض إعلانك: "${adToNotify.title}"`,
                link: `/ad/${adToNotify.id}`,
                related_id: adToNotify.id,
            });
        }
    };
    
    const addUser = async (userData: Omit<User, 'id'>): Promise<User> => {
        const newUser: User = {
            ...userData,
            id: `user-${Date.now()}`,
        };
        setState(prev => ({ ...prev, users: [...prev.users, newUser]}));
        return newUser;
    };
    
    const updateUser = async (userId: string, updatedData: Partial<Omit<User, 'id'>>) => {
        setState(prev => ({
            ...prev,
            users: prev.users.map(u => u.id === userId ? {...u, ...updatedData} : u)
        }));
    };

    const addMessage = async (messageData: Omit<ChatMessageDbRow, 'id' | 'timestamp'>): Promise<ChatMessageDbRow> => {
        const newMessage: ChatMessageDbRow = {
            ...messageData,
            id: `msg-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };
        setState(prev => ({ ...prev, messages: [...prev.messages, newMessage]}));
        return newMessage;
    };

    const updateConversationLastMessage = async (conversationId: string, message: ChatMessage) => {
        setState(prev => ({
            ...prev,
            conversations: prev.conversations.map(c => c.id === conversationId ? {...c, last_message: message} : c)
        }));
    };

    const addConversation = async (conversationData: Omit<ChatConversation, 'id'>): Promise<ChatConversation> => {
        const newConversation: ChatConversation = {
            ...conversationData,
            id: `conv-${Date.now()}`,
        };
        setState(prev => ({ ...prev, conversations: [...prev.conversations, newConversation] }));
        return newConversation;
    };

    const contextValue: AdminContextType = useMemo(() => ({
        ...state,
        settings: state.settings!,
        isDataLoaded,
        connectionStatus,
        retryConnection: () => {},
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
            setState(prev => ({ ...prev, ads: prev.ads.map(ad => ad.id === adId ? { ...ad, featured: !ad.featured } : ad) }));
        },
        createAuction: async (adId: string, startPrice: number, durationHours: number) => {
            const newAuction: Auction = {
                id: `auc-${adId}`, ad_id: adId, start_price: startPrice, current_price: startPrice,
                start_time: new Date().toISOString(), end_time: new Date(Date.now() + durationHours * 3600 * 1000).toISOString(),
                bids: [], status: 'active'
            };
            setState(prev => ({...prev, auctions: [...prev.auctions, newAuction]}));
        },
        placeBid: async (auctionId, amount, userId) => {
            const newBid: Bid = { user_id: userId, amount, timestamp: new Date().toISOString() };
            setState(prev => ({...prev, auctions: prev.auctions.map(a => a.id === auctionId ? {...a, bids: [...a.bids, newBid], current_price: amount} : a)}));
        },
        stats: {
            userCount: state.users.length,
            adCount: state.ads.length,
            pendingAdCount: state.ads.filter(a => a.status === 'pending').length,
            reviewCount: state.reviews.length,
        },
        getAdById: (adId) => state.ads.find(a => a.id === adId),
        loadAds: async (options) => { return state.ads; },
        loadAdById: async (adId) => { return state.ads.find(a=> a.id === adId) || null },
        loadUserById: async (userId) => { return state.users.find(u=> u.id === userId) || null },
        loadFeaturedContent: async () => {},
        loadReviewsForSeller: async () => {},
        loadUserContent: async () => {},
        // --- Placeholder functions to satisfy the interface ---
        createFlashDeal: async () => {}, createPersonalizedOffer: async () => {}, endFlashDeal: async () => {},
        createStockWatch: async () => {}, getStockWatchesForUser: (userId: string) => state.stockWatches.filter(sw => sw.user_id === userId), deleteStockWatch: async () => {}, featureAdForFree: async () => {},
        updateUserRole: async (userId, role) => { updateUser(userId, { role }) }, toggleUserBan: async (userId) => { const u = state.users.find(u=>u.id===userId); if(u) updateUser(userId, { banned: !u.banned }) }, toggleUserVerification: async (userId) => { const u = state.users.find(u=>u.id===userId); if(u) updateUser(userId, { is_verified: !u.is_verified }) },
        deleteUser: async () => {}, 
        updateSettings: async (newSettings) => { setState(prev => ({...prev, settings: {...prev.settings!, ...newSettings}}))},
        addExternalAd: async () => {}, updateExternalAd: async () => {}, addCategory: async () => {},
        deleteCategory: async () => {}, addSubcategory: async () => {}, deleteSubcategory: async () => {},
        addProvince: async () => {}, deleteProvince: async () => {},
        getReviewsForSeller: (sellerId) => state.reviews.filter(r => r.seller_id === sellerId), deleteReview: async () => {},
        calculateAverageRating: (sellerId: string) => {
            const relevantReviews = state.reviews.filter(r => r.seller_id === sellerId);
            if (relevantReviews.length === 0) return { average: 0, count: 0 };
            const sum = relevantReviews.reduce((acc, r) => acc + r.rating, 0);
            return { average: sum / relevantReviews.length, count: relevantReviews.length };
        },
        addReview: async () => {}, markAsRead: async () => {}, markAllAsRead: async () => {}, clearAllNotifications: async () => {},
        unreadNotificationCount: (userId: string) => state.notifications.filter(n => n.user_id === userId && !n.is_read).length,
        toggleFeatureFlag: async () => {},
        getPricingAnalysis: () => ({ myPrice: null, competitorPrices: [] }), getDemandHotspots: () => [],
        getProductOpportunities: () => [], getOpportunitiesForUser: () => [],
        getAuctionById: (auctionId: string) => state.auctions.find(a => a.id === auctionId),
        addRfq: async () => {}, addOfferToRfq: async () => {},
        getOffersForRfq: (rfqId: string) => state.offers.filter(o => o.rfq_id === rfqId),
        addMarketBrief: async (brief) => { const newBrief: MarketBrief = { ...brief, id: `brief-${Date.now()}` }; setState(prev => ({ ...prev, marketBriefs: [...prev.marketBriefs, newBrief] })); }, addDealMemo: async () => ({} as DealMemo), updateDealMemo: async () => {},
        scanForSuspiciousActivity: async () => {}, getSmartPaymentByMemoId: (memoId: string) => state.smartPayments.find(p => p.memo_id === memoId),
        initiateSmartPayment: async () => ({} as SmartPayment), updateSmartPaymentStatus: async () => {},
        addShippingInfoToPayment: async () => {}, raiseDispute: async () => {}, resolveDispute: async () => {},
        calculatePartnershipScore: () => ({ dealCount: 0, avgRating: 0 }), grantReferralReward: async () => {},
        applyFreeFeature: async () => {}, addNegotiationSession: async () => ({} as NegotiationSession),
        addNegotiationMessage: async () => {}, addDonationToCampaign: async () => {}, addCampaign: async () => ({} as Campaign),
        updateCampaign: async () => {}, deleteCampaign: async () => {},
    }), [state, isDataLoaded, connectionStatus, createNotification]);
    
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