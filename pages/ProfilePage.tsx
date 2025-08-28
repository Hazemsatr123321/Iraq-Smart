
import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/common/Button';
import { useUser } from '../contexts/UserContext';
import { useAdmin } from '../contexts/AdminContext';
import { Rating } from '../components/Rating';
import type { Ad, ToastType, User, UserRole, ProfileTab, PartnershipScore } from '../types';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { AdCard } from '../components/AdCard';
import { UserIcon } from '../components/icons/UserIcon';
import { TabButton } from '../components/profile/TabButton';
import { MyAdsList } from '../components/profile/MyAdsList';
import { AccountSettings } from '../components/profile/AccountSettings';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { BinocularsIcon } from '../components/icons/BinocularsIcon';
import { WatchedAdsList } from '../components/profile/WatchedAdsList';
import { RadarIcon } from '../components/icons/RadarIcon';
import { StockWatchList } from '../components/profile/StockWatchList';
import { GavelIcon } from '../components/icons/GavelIcon';
import { ClipboardIcon } from '../components/icons/ClipboardIcon';
import { MyRfqsList } from '../components/profile/MyRfqsList';
import { MyBidsList } from '../components/profile/MyBidsList';
import { PartnershipScoreBadge } from '../components/PartnershipScoreBadge';
import { generatePartnershipAnalysis } from '../services/geminiService';
import { FullScreenLoader } from '../components/common/FullScreenLoader';


const getDefaultTab = (user: User | null, isMyProf: boolean): ProfileTab => {
  if (!user) return 'myAds';
  const isWholesaler = user.role === 'wholesaler' || user.role === 'admin';
  if (isMyProf) {
    return isWholesaler ? 'myAds' : 'favorites';
  }
  return 'myAds';
};

export const ProfilePage: React.FC<{ 
    onNavigate: (path: string) => void, 
    userId?: string,
    addToast: (message: string, type?: ToastType) => void,
    onOpenOptimizer: (ad: Ad) => void;
    onOpenFlashDeal: (ad: Ad) => void;
}> = ({ onNavigate, userId, addToast, onOpenOptimizer, onOpenFlashDeal }) => {
  const { currentUser, favorite_ad_ids } = useUser();
  const { users, ads, getReviewsForSeller, calculateAverageRating, calculatePartnershipScore } = useAdmin();
  
  const profileUserId = userId || currentUser?.id;
  const profileUser = useMemo(() => users.find(u => u.id === profileUserId), [profileUserId, users]);
  const isMyProfile = profileUser?.id === currentUser?.id;

  const [isLoading, setIsLoading] = useState(!profileUser);
  const [activeTab, setActiveTab] = useState<ProfileTab>('myAds');
  const [partnershipScore, setPartnershipScore] = useState<PartnershipScore | null>(null);

  useEffect(() => {
    if (!profileUser) {
        setIsLoading(true);
    } else {
        setIsLoading(false);
    }
  }, [profileUser]);
  
  useEffect(() => {
    let isMounted = true;
    if (currentUser && profileUser && !isMyProfile) {
        const scoreData = calculatePartnershipScore(currentUser.id, profileUser.id);
        const dealCount = scoreData.dealCount;
        
        if (dealCount > 0) {
            const calculatedScore = Math.round(Math.min(100, 10 + dealCount * 20 + scoreData.avgRating * 5));
            generatePartnershipAnalysis(calculatedScore, dealCount).then(analysis => {
                if (isMounted) {
                    setPartnershipScore({ score: calculatedScore, analysis });
                }
            });
        } else {
             setPartnershipScore({ score: 15, analysis: "هذه بداية علاقة تجارية جديدة. أكمل الصفقات لزيادة مؤشر الشراكة." });
        }
    } else {
        setPartnershipScore(null);
    }
    return () => { isMounted = false; };
  }, [currentUser, profileUser, isMyProfile, calculatePartnershipScore]);


  const favoriteAds = useMemo(() => ads.filter(ad => favorite_ad_ids.includes(ad.id) && ad.status === 'approved'), [favorite_ad_ids, ads]);
  
  const myAds = useMemo(() => {
    if (!profileUser) return [];
    return ads.filter(ad => ad.user_id === profileUser.id).sort((a,b) => (a.id && b.id) ? b.id.localeCompare(a.id) : 0);
  }, [profileUser, ads]);

  const sellerReviews = useMemo(() => {
    if (!profileUser) return [];
    return getReviewsForSeller(profileUser.id);
  }, [profileUser, getReviewsForSeller]);

  const { average: avgRating, count: reviewCount } = useMemo(() => {
    if (!profileUser) return { average: 0, count: 0 };
    return calculateAverageRating(profileUser.id);
  }, [profileUser, calculateAverageRating]);

  useEffect(() => {
      const location = window.location.hash;
      const urlParams = new URLSearchParams(location.split('?')[1]);
      const tabFromUrl = urlParams.get('tab') as ProfileTab | null;
      if (tabFromUrl) {
          setActiveTab(tabFromUrl);
      } else if (profileUser) {
          setActiveTab(getDefaultTab(profileUser, isMyProfile));
      }
  }, [location.hash, profileUser, isMyProfile]);

  if (isLoading) {
      return <FullScreenLoader />;
  }

  if (!profileUser) {
      return null; // The main App component handles redirection
  }
  
  const pageTitle = isMyProfile ? "ملفي الشخصي" : `ملف ${profileUser.name}`;
  const isWholesaler = profileUser.role === 'wholesaler' || profileUser.role === 'admin';

  return (
    <div className="bg-brand-primary min-h-screen text-brand-text">
      <Header variant="page" title={pageTitle} onBack={() => window.history.back()} onNavigate={onNavigate} />

      <main className="container mx-auto p-4 pb-24">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center text-center md:text-right gap-6 p-6 bg-brand-secondary rounded-2xl mb-8">
          <img src={profileUser.profile_picture} alt={profileUser.name} className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-brand-accent flex-shrink-0" />
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-brand-text">{profileUser.name}</h1>
                  {profileUser.is_verified && <VerifiedBadge className="w-7 h-7" />}
                  {partnershipScore && <PartnershipScoreBadge scoreData={partnershipScore} />}
                </div>
                 {isMyProfile && (
                    <Button onClick={() => onNavigate('/account')} variant="secondary" className="!py-2 !px-4 mt-4 md:mt-0 flex items-center gap-2">
                        <UserIcon className="w-5 h-5"/>
                        العودة لحسابي
                    </Button>
                )}
            </div>

            <p className="text-brand-text-secondary mt-1">{isWholesaler ? profileUser.store_name : 'صاحب محل'}</p>
             {isWholesaler && (
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <Rating rating={avgRating} />
                    <span className="text-sm text-brand-text-secondary">({reviewCount} مراجعة)</span>
                </div>
             )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 md:gap-6 border-b border-gray-700 mb-6 overflow-x-auto">
          {isWholesaler && <TabButton isActive={activeTab === 'myAds'} onClick={() => setActiveTab('myAds')}>إعلاناتي <span className="bg-brand-primary text-brand-accent text-xs font-bold px-2 py-0.5 rounded-full">{myAds.length}</span></TabButton>}
          {!isWholesaler && isMyProfile && <TabButton isActive={activeTab === 'myRfqs'} onClick={() => setActiveTab('myRfqs')}><ClipboardIcon className="w-5 h-5"/> طلباتي</TabButton>}
          {isMyProfile && <TabButton isActive={activeTab === 'myBids'} onClick={() => setActiveTab('myBids')}><GavelIcon className="w-5 h-5"/> عروضي</TabButton>}
          {isMyProfile && <TabButton isActive={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')}><HeartIcon className="w-5 h-5"/> المفضلة</TabButton>}
          {isMyProfile && <TabButton isActive={activeTab === 'stockWatch'} onClick={() => setActiveTab('stockWatch')}><RadarIcon className="w-5 h-5"/> رادار السوق</TabButton>}
          {isMyProfile && isWholesaler && <TabButton isActive={activeTab === 'watched'} onClick={() => setActiveTab('watched')}><BinocularsIcon className="w-5 h-5"/> مراقبتي</TabButton>}
          {isWholesaler && <TabButton isActive={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>التقييمات</TabButton>}
          {isMyProfile && <TabButton isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')}><SettingsIcon className="w-5 h-5"/> الإعدادات</TabButton>}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'favorites' && isMyProfile && (
            <div>
              {favoriteAds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favoriteAds.map(ad => (
                    <div key={ad.id} className="animate-fadeInUp" style={{animationDelay: `${ad.id.slice(-1)}0ms`}} >
                        <AdCard ad={ad} onClick={() => onNavigate(`/ad/${ad.id}`)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-brand-text-secondary text-xl">قائمة المفضلة فارغة.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'myAds' && isWholesaler && (
             <MyAdsList ads={myAds} onNavigate={onNavigate} addToast={addToast} onOpenOptimizer={onOpenOptimizer} onOpenFlashDeal={onOpenFlashDeal} />
          )}
          
          {activeTab === 'watched' && isMyProfile && (
            <WatchedAdsList onNavigate={onNavigate} />
          )}

           {activeTab === 'stockWatch' && isMyProfile && (
            <StockWatchList onNavigate={onNavigate} />
           )}
           
          {activeTab === 'myRfqs' && !isWholesaler && isMyProfile && (
            <MyRfqsList onNavigate={onNavigate} />
          )}
          
          {activeTab === 'myBids' && isMyProfile && (
            <MyBidsList onNavigate={onNavigate} />
          )}

          {activeTab === 'reviews' && isWholesaler && (
             <div>
                {sellerReviews.length > 0 ? (
                    <div className="space-y-4 max-w-3xl mx-auto">
                        <div className="bg-brand-secondary p-4 rounded-lg flex items-center justify-center gap-4 mb-6">
                            <span className="text-xl font-bold">التقييم العام:</span>
                            <Rating rating={avgRating} starClassName="w-7 h-7" />
                            <span className="text-2xl font-bold text-brand-accent">{avgRating.toFixed(1)}</span>
                        </div>
                        {sellerReviews.map(review => {
                            const reviewer = users.find(u => u.id === review.reviewer_id);
                            return (
                                <div key={review.id} className="bg-brand-secondary p-4 rounded-lg">
                                    <div className="flex items-start gap-4">
                                        <img src={reviewer?.profile_picture} alt={reviewer?.name} className="w-12 h-12 rounded-full" />
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-brand-text">{reviewer?.name || 'مستخدم'}</span>
                                                <Rating rating={review.rating} />
                                            </div>
                                            <p className="text-brand-text-secondary mt-2">{review.comment}</p>
                                            <p className="text-xs text-gray-500 mt-2 text-left">{new Date(review.timestamp).toLocaleDateString('ar-IQ')}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                      <p className="text-brand-text-secondary text-xl">لا توجد تقييمات لهذا التاجر بعد.</p>
                    </div>
                )}
             </div>
          )}
          
           {activeTab === 'settings' && isMyProfile && (
                <AccountSettings user={profileUser} addToast={addToast} />
           )}
        </div>
      </main>
    </div>
  );
};
