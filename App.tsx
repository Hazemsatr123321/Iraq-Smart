
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { HomePage } from './pages/HomePage';
import { PostAdPage } from './pages/PostAdPage';
import { AdDetailPage } from './pages/AdDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { ChatListPage } from './pages/ChatListPage';
import { ChatDetailPage } from './pages/ChatDetailPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdsExplorerPage } from './pages/AdsExplorerPage';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { MarketAdvisorPage } from './pages/MarketAdvisorPage';
import { AuctionsListPage } from './pages/AuctionsListPage';
import { AuctionDetailPage } from './pages/AuctionDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { BottomNav } from './components/BottomNav';
import { AIAssistant } from './components/AIAssistant';
import { AIAssistantMode, Review, User, Toast, ToastType, UserRole, Ad, AdminSection } from './types';
import { UserProvider, useUser } from './contexts/UserContext';
import { ChatProvider, useChat } from './contexts/ChatContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { LeaveReviewModal } from './components/LeaveReviewModal';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { AccountPage } from './pages/AccountPage';
import { ToastContainer } from './components/ToastContainer';
import { AdOptimizerModal } from './components/modals/AdOptimizerModal';
import { CreateFlashDealModal } from './components/modals/CreateFlashDealModal';
import { CreateStockWatchModal } from './components/modals/CreateStockWatchModal';
import { FullScreenLoader } from './components/common/FullScreenLoader';
import { RFQListPage } from './pages/RFQListPage';
import { PostRFQPage } from './pages/PostRFQPage';
import { DailyBriefPage } from './pages/DailyBriefPage';
import { ImpersonationBanner } from './components/ImpersonationBanner';
import { MarketAnalystPage } from './pages/MarketAnalystPage';
import { OpportunitiesHubPage } from './pages/OpportunitiesHubPage';
import { SafePayPage } from './pages/SafePayPage';
import { NegotiationPage } from './pages/NegotiationPage';
import { PermissionWelcomeModal } from './components/modals/PermissionWelcomeModal';
import { FeatureAdModal } from './components/modals/FeatureAdModal';
import { ReferralsPage } from './pages/ReferralsPage';
import { SocialSupportPage } from './pages/SocialSupportPage';
import { InstallPWA } from './components/InstallPWA';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConfirmationModal } from './components/modals/ConfirmationModal';
import { PromptModal } from './components/modals/PromptModal';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DraggableAIAssistantButton } from './components/DraggableAIAssistantButton';

const AppContent: React.FC = () => {
    const [location, setLocation] = useState(window.location.hash || '#/');
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [aiMode, setAIMode] = useState<AIAssistantMode>(AIAssistantMode.NONE);
    const [generatedAdContent, setGeneratedAdContent] = useState({ title: '', description: '' });
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewModalData, setReviewModalData] = useState<{ adId: string; sellerId: string } | null>(null);
    const [postLoginPath, setPostLoginPath] = useState<string>('/');
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [optimizerModalAd, setOptimizerModalAd] = useState<Ad | null>(null);
    const [flashDealModalAd, setFlashDealModalAd] = useState<Ad | null>(null);
    const [isStockWatchModalOpen, setStockWatchModalOpen] = useState(false);
    const [showPermissionWelcome, setShowPermissionWelcome] = useState(false);
    const [featureModalAd, setFeatureModalAd] = useState<Ad | null>(null);
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; } | null>(null);
    const [prompt, setPrompt] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: (value: string) => void; } | null>(null);

    const [pageKey, setPageKey] = useState(location);
    const [animationClass, setAnimationClass] = useState('animate-page-enter');
    const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const pageContainerRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const isSwiping = useRef(false);

    const { currentUser, isInitialized, impersonatingAdminId, stopImpersonating, authEvent, setAuthEvent, logout } = useUser();
    const { settings, addReview, users, createFlashDeal, createStockWatch, isDataLoaded, unreadNotificationCount } = useAdmin();
    const { unreadCount: unreadChatCount } = useChat();
    
    const addToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    useEffect(() => {
        const showConfirmation = (e: any) => setConfirmation({ isOpen: true, title: e.detail.title || 'هل أنت متأكد؟', message: e.detail.message, onConfirm: e.detail.onConfirm });
        const showPrompt = (e: any) => setPrompt({ isOpen: true, title: e.detail.title || 'إدخال', message: e.detail.message, onConfirm: e.detail.onConfirm });
        
        window.addEventListener('show-confirm', showConfirmation);
        window.addEventListener('show-prompt', showPrompt);
        
        return () => {
            window.removeEventListener('show-confirm', showConfirmation);
            window.removeEventListener('show-prompt', showPrompt);
        };
    }, []);

    const handleConfirm = () => {
        if (confirmation?.onConfirm) confirmation.onConfirm();
        setConfirmation(null);
    };
    
    const handlePromptConfirm = (value: string) => {
        if (prompt?.onConfirm) prompt.onConfirm(value);
        setPrompt(null);
    };

    useEffect(() => {
        const welcomeSeen = localStorage.getItem('permission_welcome_seen');
        if (!welcomeSeen && 'permissions' in navigator) {
            navigator.permissions.query({ name: 'microphone' as PermissionName }).then(status => {
                if (status.state === 'prompt') {
                    setShowPermissionWelcome(true);
                } else {
                    localStorage.setItem('permission_welcome_seen', 'true');
                }
            }).catch(() => {
                localStorage.setItem('permission_welcome_seen', 'true');
            });
        }
    }, []);
    
    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e);
            const installBannerDismissed = sessionStorage.getItem('install_banner_dismissed');
            if (!installBannerDismissed) {
                setShowInstallBanner(true);
            }
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    useEffect(() => {
        if (!currentUser) {
            if ('clearAppBadge' in navigator) {
                // @ts-ignore
                navigator.clearAppBadge().catch((error: any) => console.error("Error clearing app badge:", error));
            }
            return;
        }
        const totalUnread = unreadChatCount + unreadNotificationCount(currentUser.id);
        if ('setAppBadge' in navigator) {
            if (totalUnread > 0) {
                // @ts-ignore
                navigator.setAppBadge(totalUnread).catch((error: any) => console.error("Error setting app badge:", error));
            } else {
                // @ts-ignore
                navigator.clearAppBadge().catch((error: any) => console.error("Error clearing app badge:", error));
            }
        }
    }, [currentUser, unreadChatCount, unreadNotificationCount]);

    const handleNavigation = useCallback((path: string, adminSection?: AdminSection) => {
        let newHash = path;
        if (adminSection) {
            newHash += `?section=${adminSection}`;
        }
        if (`#${newHash}` !== window.location.hash) {
            window.location.hash = newHash;
        }
    }, []);
    

    useEffect(() => {
        const handleHashChange = () => {
            setLocation(window.location.hash || '#/');
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial load
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
     useEffect(() => {
        if (authEvent === 'PASSWORD_RECOVERY') {
            handleNavigation('/reset-password');
            setAuthEvent(null);
        }
    }, [authEvent, handleNavigation, setAuthEvent]);

    useEffect(() => {
        if (pageKey === location) return;
        setAnimationClass('animate-page-exit');
        const timeoutId = setTimeout(() => {
            setPageKey(location);
            setAnimationClass('animate-page-enter');
            window.scrollTo(0, 0);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [location, pageKey]);

    useEffect(() => {
        const container = pageContainerRef.current;
        if (!container) return;
        const handleTouchStart = (e: TouchEvent) => {
            const path = window.location.hash.substring(1).split('?')[0] || '/';
            if (path === '/' || path === '/auth' || path.startsWith('/chat/')) {
                isSwiping.current = false;
                return;
            }
            if (e.touches[0].clientX < 50) {
                touchStartX.current = e.touches[0].clientX;
            } else {
                touchStartX.current = 0;
            }
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (touchStartX.current === 0) return;
            const touchCurrentX = e.touches[0].clientX;
            const deltaX = touchCurrentX - touchStartX.current;
            if (deltaX > 10 && !isSwiping.current) {
                isSwiping.current = true;
                container.classList.add('swiping');
            }
            if (isSwiping.current) {
                const swipeAmount = Math.max(0, deltaX);
                container.style.transform = `translateX(${swipeAmount}px)`;
            }
        };
        const handleTouchEnd = (e: TouchEvent) => {
            if (!isSwiping.current) return;
            const touchEndX = e.changedTouches[0].clientX;
            const deltaX = touchEndX - touchStartX.current;
            container.classList.remove('swiping');
            if (deltaX > window.innerWidth / 3) {
                window.history.back();
            }
            setTimeout(() => { if (container) { container.style.transform = ''; } }, 300);
            isSwiping.current = false;
            touchStartX.current = 0;
        };
        container.addEventListener('touchstart', handleTouchStart);
        container.addEventListener('touchmove', handleTouchMove);
        container.addEventListener('touchend', handleTouchEnd);
        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [pageKey]);

    const handleOpenOptimizer = useCallback((ad: Ad) => setOptimizerModalAd(ad), []);
    const handleCloseOptimizer = useCallback(() => setOptimizerModalAd(null), []);
    const handleOpenFlashDeal = useCallback((ad: Ad) => setFlashDealModalAd(ad), []);
    const handleCloseFlashDeal = useCallback(() => setFlashDealModalAd(null), []);
    const handleOpenStockWatch = useCallback(() => setStockWatchModalOpen(true), []);
    const handleCloseStockWatch = useCallback(() => setStockWatchModalOpen(false), []);
    const handleOpenFeatureModal = useCallback((ad: Ad) => setFeatureModalAd(ad), []);
    const handleCloseFeatureModal = useCallback(() => setFeatureModalAd(null), []);

    const handleLogout = async () => {
        try {
            await logout();
            handleNavigation('/');
            addToast('تم تسجيل الخروج بنجاح.', 'success');
        } catch (error: any) {
            addToast(error.message || 'فشل تسجيل الخروج.', 'error');
        }
    };

    const handleStopImpersonating = async () => {
        await stopImpersonating();
        addToast(`عدت إلى حساب المدير`, 'success');
        handleNavigation('/admin');
    }
    
    useEffect(() => {
        if (!isInitialized || !isDataLoaded) return;
        const path = location.substring(1).split('?')[0] || '/';
        const protectedRoutes = ['/post', '/chat', '/profile', '/notifications', '/account', '/advisor', '/analyst', '/auctions', '/post-rfq', '/briefing', '/opportunities-hub', '/safepay', '/negotiation', '/referrals', '/social-support', '/reset-password'];
        const isAdminRoute = path.startsWith('/admin');
        const adminRoles: UserRole[] = ['admin', 'moderator', 'support'];
        const isProtectedRoute = (p: string) => protectedRoutes.some(route => p.startsWith(route));
        
        if (path === '/reset-password' && authEvent === 'PASSWORD_RECOVERY') {
            return;
        }

        if (isProtectedRoute(path) && !currentUser) {
            setPostLoginPath(path);
            handleNavigation('/auth');
            return;
        }
        if (isAdminRoute && (!currentUser || !adminRoles.includes(currentUser.role))) {
            addToast("ليس لديك الصلاحية للوصول لهذه الصفحة.", 'error');
            handleNavigation('/');
            return;
        }
    }, [isInitialized, isDataLoaded, currentUser, location, handleNavigation, addToast, authEvent]);


    const handleAdGenerated = (content: { title: string, description: string }) => {
        setGeneratedAdContent(content);
        handleNavigation('/post');
    };

    const handleSearchParsed = (filters: any) => {
        const searchParams = new URLSearchParams();
        if (filters.product) searchParams.set('q', filters.product);
        if (filters.location) searchParams.set('province', filters.location);
        handleNavigation(`/ads?${searchParams.toString()}`);
    }

    const handleReviewSubmit = async (rating: number, comment: string) => {
        if (reviewModalData && currentUser) {
            await addReview({
                ad_id: reviewModalData.adId,
                seller_id: reviewModalData.sellerId,
                reviewer_id: currentUser.id,
                rating,
                comment,
            });
            addToast('شكراً لك! تم إرسال تقييمك بنجاح.', 'success');
            setReviewModalOpen(false);
        }
    };
    
    const handleCreateFlashDeal = (adId: string, dealPrice: string, durationHours: number) => {
        createFlashDeal(adId, dealPrice, durationHours);
        addToast('تم إنشاء صفقة البرق بنجاح!', 'success');
        handleCloseFlashDeal();
    }
    
    const handleCreateStockWatch = (watchData: any) => {
        if(!currentUser) return;
        createStockWatch(watchData, currentUser.id);
        addToast('تم إنشاء رادار السوق بنجاح!', 'success');
        handleCloseStockWatch();
    };

    const handleInstall = async () => {
        if (installPromptEvent) {
            installPromptEvent.prompt();
            const { outcome } = await installPromptEvent.userChoice;
            if (outcome === 'accepted') {
                addToast('تم تثبيت التطبيق بنجاح!', 'success');
            }
            setInstallPromptEvent(null);
            setShowInstallBanner(false);
        }
    };
    const handleDismissInstall = () => {
        sessionStorage.setItem('install_banner_dismissed', 'true');
        setShowInstallBanner(false);
    };

    const handleLoginSuccess = useCallback((user: User) => {
        const adminRoles: UserRole[] = ['admin', 'moderator', 'support'];
        if (adminRoles.includes(user.role)) {
            handleNavigation('/admin');
        } else {
            handleNavigation(postLoginPath);
        }
    }, [handleNavigation, postLoginPath]);

    const renderPage = () => {
        const path = location.substring(1).split('?')[0] || '/';
        const urlParams = new URLSearchParams(location.split('?')[1]);
        const refCode = urlParams.get('ref') || undefined;

        if (settings?.maintenance_mode && currentUser?.role !== 'admin') {
            return <MaintenancePage />;
        }
        
        if (path.startsWith('/ad/')) {
            const adId = path.substring(4);
            return <AdDetailPage adId={adId} onNavigate={handleNavigation} onOpenReviewModal={(adId, sellerId) => { setReviewModalData({ adId, sellerId }); setReviewModalOpen(true); }} addToast={addToast} />;
        }
        if (path.startsWith('/profile/')) {
            const userId = path.substring(9);
            return <ProfilePage userId={userId} onNavigate={handleNavigation} addToast={addToast} onOpenOptimizer={handleOpenOptimizer} onOpenFlashDeal={handleOpenFlashDeal} onOpenFeatureModal={handleOpenFeatureModal}/>;
        }
         if (path.startsWith('/chat/')) {
            const conversationId = path.substring(6);
            return <ChatDetailPage conversationId={conversationId} onNavigate={handleNavigation} addToast={addToast}/>;
        }
        if (path.startsWith('/post/edit/')) {
            const adIdToEdit = path.substring(11);
            return <PostAdPage onNavigate={handleNavigation} onOpenAI={mode => { setAIMode(mode); setIsAIOpen(true); }} onAdGenerated={setGeneratedAdContent} adContent={generatedAdContent} addToast={addToast} adIdToEdit={adIdToEdit} onOpenFeatureModal={handleOpenFeatureModal} />;
        }
        if (path.startsWith('/auction/')) {
            const auctionId = path.substring(9);
            return <AuctionDetailPage auctionId={auctionId} onNavigate={handleNavigation} addToast={addToast} />;
        }
        if (path.startsWith('/safepay/')) {
            const memoId = path.substring(9);
            return <SafePayPage memoId={memoId} onNavigate={handleNavigation} addToast={addToast} />;
        }
        if (path.startsWith('/negotiation/')) {
            const adId = path.substring(13);
            return <NegotiationPage adId={adId} onNavigate={handleNavigation} addToast={addToast} />;
        }

        switch (path) {
            case '/': return <HomePage onNavigate={handleNavigation} />;
            case '/post': return <PostAdPage onNavigate={handleNavigation} onOpenAI={mode => { setAIMode(mode); setIsAIOpen(true); }} onAdGenerated={setGeneratedAdContent} adContent={generatedAdContent} addToast={addToast} onOpenFeatureModal={handleOpenFeatureModal} />;
            case '/chat': return <ChatListPage onNavigate={handleNavigation} />;
            case '/notifications': return <NotificationsPage onNavigate={handleNavigation} />;
            case '/ads': return <AdsExplorerPage onNavigate={handleNavigation} onOpenStockWatch={handleOpenStockWatch} />;
            case '/auth':
                return <AuthPage onLoginSuccess={handleLoginSuccess} onRegisterSuccess={() => handleNavigation(postLoginPath)} onNavigate={handleNavigation} referrerId={refCode}/>;
            case '/reset-password': return <ResetPasswordPage onNavigate={handleNavigation} addToast={addToast} />;
            case '/account': return <AccountPage onNavigate={handleNavigation} onLogout={handleLogout} />;
            case '/admin': return <AdminPage onNavigate={handleNavigation} onLogout={handleLogout} />;
            case '/advisor': return <MarketAdvisorPage onNavigate={handleNavigation} />;
            case '/analyst': return <MarketAnalystPage onNavigate={handleNavigation} />;
            case '/auctions': return <AuctionsListPage onNavigate={handleNavigation} />;
            case '/rfqs': return <RFQListPage onNavigate={handleNavigation} addToast={addToast} />;
            case '/post-rfq': return <PostRFQPage onNavigate={handleNavigation} addToast={addToast} />;
            case '/briefing': return <DailyBriefPage onNavigate={handleNavigation} />;
            case '/opportunities-hub': return <OpportunitiesHubPage onNavigate={handleNavigation} />;
            case '/referrals': return <ReferralsPage onNavigate={handleNavigation} addToast={addToast} />;
            case '/social-support': return <SocialSupportPage onNavigate={handleNavigation} addToast={addToast} />;
            default: return <NotFoundPage onNavigate={handleNavigation} />;
        }
    };
    
    if (!isInitialized || !isDataLoaded) {
      return <FullScreenLoader />;
    }

    const path = location.substring(1).split('?')[0] || '/';

    return (
        <div className="bg-brand-primary min-h-screen text-brand-text">
            {settings?.is_announcement_active && <AnnouncementBanner text={settings.announcement_text} type={settings.announcement_type} />}
            {impersonatingAdminId && <ImpersonationBanner adminName={users.find(u => u.id === impersonatingAdminId)?.name || 'Admin'} onStop={handleStopImpersonating} />}
            {showInstallBanner && <InstallPWA onInstall={handleInstall} onDismiss={handleDismissInstall} />}
            
            <div ref={pageContainerRef} className={`page-container ${animationClass}`} key={pageKey}>
                {renderPage()}
            </div>

            <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} mode={aiMode} onAdGenerated={handleAdGenerated} onSearchParsed={handleSearchParsed} />
            <LeaveReviewModal isOpen={isReviewModalOpen} onClose={() => setReviewModalOpen(false)} onSubmit={handleReviewSubmit} sellerName={reviewModalData ? users.find(u => u.id === reviewModalData.sellerId)?.name || '' : ''} />
            <AdOptimizerModal ad={optimizerModalAd} onClose={handleCloseOptimizer} />
            <CreateFlashDealModal ad={flashDealModalAd} onClose={handleCloseFlashDeal} onSubmit={handleCreateFlashDeal} />
            <CreateStockWatchModal isOpen={isStockWatchModalOpen} onClose={handleCloseStockWatch} onSubmit={handleCreateStockWatch} />
            <PermissionWelcomeModal isOpen={showPermissionWelcome} onClose={() => { setShowPermissionWelcome(false); localStorage.setItem('permission_welcome_seen', 'true'); }} />
            <FeatureAdModal ad={featureModalAd} onClose={handleCloseFeatureModal} addToast={addToast} />
            <ConfirmationModal
                isOpen={!!confirmation?.isOpen}
                onClose={() => setConfirmation(null)}
                onConfirm={handleConfirm}
                title={confirmation?.title || ''}
                message={confirmation?.message || ''}
            />
            <PromptModal
                isOpen={!!prompt?.isOpen}
                onClose={() => setPrompt(null)}
                onConfirm={handlePromptConfirm}
                title={prompt?.title || ''}
                message={prompt?.message || ''}
            />
            
            <ToastContainer toasts={toasts} setToasts={setToasts} />
            {!path.startsWith('/admin') && <BottomNav onNavigate={handleNavigation} activePath={path} />}
            
            {!path.startsWith('/admin') && <DraggableAIAssistantButton onClick={() => { setIsAIOpen(true); setAIMode(AIAssistantMode.SEARCH); }} />}
        </div>
    );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
        <AdminProvider>
            <UserProvider>
                <ChatProvider>
                    <AppContent />
                </ChatProvider>
            </UserProvider>
        </AdminProvider>
    </ThemeProvider>
  );
};

export default App;
