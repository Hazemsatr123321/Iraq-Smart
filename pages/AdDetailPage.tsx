

import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/common/Button';
import { useUser } from '../contexts/UserContext';
import { HeartIcon } from '../components/icons/HeartIcon';
import { useChat } from '../contexts/ChatContext';
import { Rating } from '../components/Rating';
import { useAdmin } from '../contexts/AdminContext';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { GavelIcon } from '../components/icons/GavelIcon';
import { BinocularsIcon } from '../components/icons/BinocularsIcon';
import { SellerReputationBadge } from '../components/SellerReputationBadge';
import { LogisticsEstimator } from '../components/LogisticsEstimator';
import { AIVerifiedBadge } from '../components/AIVerifiedBadge';
import { BotIcon } from '../components/icons/BotIcon';
import { HandHeartIcon } from '../components/icons/HandHeartIcon';
import { ShareIcon } from '../components/icons/ShareIcon';
import { ToastType } from '../types';
import { FullScreenLoader } from '../components/common/FullScreenLoader';
import { NotFoundPage } from './NotFoundPage';

export const AdDetailPage: React.FC<{ 
    adId: string, 
    onNavigate: (path: string) => void,
    onOpenReviewModal: (adId: string, sellerId: string) => void,
    addToast: (message: string, type?: ToastType) => void;
}> = ({ adId, onNavigate, onOpenReviewModal, addToast }) => {
  const { ads, users, reviews, getAuctionById, trackAdView, calculateAverageRating } = useAdmin(); 
  const { currentUser, favorite_ad_ids, toggleFavorite, toggleWatchAd } = useUser();
  const { startConversation } = useChat();
  const [isChatting, setIsChatting] = useState(false);
  
  const ad = ads.find(a => a.id === adId);
  const user = users.find(u => u.id === ad?.user_id);
  const auction = ad?.auction_id ? getAuctionById(ad.auction_id) : undefined;
  const [mainImage, setMainImage] = React.useState(ad?.images[0] || '');

  useEffect(() => {
    if(ad) {
      trackAdView(ad.id);
      if(!mainImage) setMainImage(ad.images[0] || '');
    }
  }, [adId, ad, trackAdView, mainImage]);

  const hasUserReviewedSeller = (sellerId: string) => {
      if (!currentUser) return false;
      return reviews.some(review => review.reviewer_id === currentUser.id && review.seller_id === sellerId);
  };

  const isFavorite = ad && currentUser ? favorite_ad_ids.includes(ad.id) : false;
  const isWatched = ad && currentUser ? currentUser.watched_ad_ids.includes(ad.id) : false;

  const handleActionRequiringAuth = (action: () => void) => {
      if (!currentUser) {
          onNavigate('/auth');
          return;
      }
      action();
  }
  
  const handleStartChat = () => {
    handleActionRequiringAuth(async () => {
        if (!user || !currentUser || !ad) return;
        if (user.id === currentUser.id) {
            addToast("لا يمكنك مراسلة نفسك.", "error");
            return;
        }
        setIsChatting(true);
        try {
            const conversation = await startConversation(user.id, ad);
            if (conversation) {
                onNavigate(`/chat/${conversation.id}`);
            }
        } catch (error) {
            console.error("Error starting conversation:", error);
            addToast("فشل في بدء المحادثة.", "error");
        } finally {
            setIsChatting(false);
        }
    });
  };

  const handleStartNegotiation = () => {
    handleActionRequiringAuth(() => {
        if (!user || !currentUser || !ad) return;
         if (user.id === currentUser.id) {
            addToast("لا يمكنك التفاوض مع نفسك.", "error");
            return;
        }
        onNavigate(`/negotiation/${ad.id}`);
    });
  }

  const handleToggleFavorite = () => {
      if (!ad) return;
      handleActionRequiringAuth(() => {
          toggleFavorite(ad.id);
      })
  }

  const handleToggleWatch = () => {
      if (!ad) return;
      handleActionRequiringAuth(() => {
          toggleWatchAd(ad.id);
      })
  }
  
  const handleAddReview = () => {
      if (!ad || !user) return;
      handleActionRequiringAuth(() => {
          onOpenReviewModal(ad.id, user.id);
      })
  }

  const handleShare = async () => {
    if (!ad) return;
    const shareData = {
      title: `سوق العراق الذكي: ${ad.title}`,
      text: `شاهد هذا الإعلان على سوق العراق الذكي: ${ad.title} - ${ad.price}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share failed:", err);
        // User probably cancelled the share, so no toast is needed.
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareData.url).then(() => {
        addToast('تم نسخ رابط الإعلان إلى الحافظة!', 'success');
      }).catch(() => {
        addToast('فشل نسخ رابط الإعلان.', 'error');
      });
    }
  };

  if (!ad || !user) {
    return <NotFoundPage onNavigate={onNavigate} />;
  }

  const { average: avgRating, count: reviewCount } = calculateAverageRating(user.id);
  const canReview = currentUser && currentUser.id !== user.id && !hasUserReviewedSeller(user.id);
  
  const isMyAd = currentUser?.id === ad.user_id;

  return (
    <div className="bg-brand-primary min-h-screen text-brand-text">
       <Header variant="page" title={ad.title} onBack={() => window.history.back()} onNavigate={onNavigate}/>

      <main className="container mx-auto p-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Gallery */}
            <div className="lg:col-span-2">
                <div className="bg-brand-secondary rounded-2xl overflow-hidden mb-4 shadow-lg relative">
                    <img src={mainImage} alt={ad.title} className="w-full h-[450px] object-cover transition-all duration-300 hover:scale-105" />
                    {auction && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white px-4 py-1.5 text-base font-bold rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
                            <GavelIcon className="w-5 h-5"/>
                            مــزاد!
                        </div>
                    )}
                    {ad.is_charitable && (
                        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1.5 text-sm font-bold rounded-full shadow-lg flex items-center gap-1.5">
                            <HandHeartIcon className="w-4 h-4" />
                            مبادرة خيرية
                        </div>
                    )}
                    {ad.ai_quality_verification_status === 'verified' && (
                        <AIVerifiedBadge className="absolute bottom-3 right-3"/>
                    )}
                </div>
                <div className="flex gap-2">
                    {ad.images.map((img, index) => (
                        <img 
                            key={index}
                            src={img}
                            alt={`thumbnail ${index}`}
                            onClick={() => setMainImage(img)}
                            className={`w-24 h-24 object-cover rounded-lg cursor-pointer border-2 transition-all ${mainImage === img ? 'border-brand-accent shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Ad Details & Seller Info */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-brand-secondary p-6 rounded-2xl">
                    <h1 className="text-3xl font-bold text-brand-text mb-2">{ad.title}</h1>
                    <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm text-brand-text-secondary">{ad.province} - {ad.category}</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                        <div className="flex items-center gap-1">
                            <Rating rating={avgRating} />
                            <span className="text-xs text-brand-text-secondary ml-1">({reviewCount})</span>
                        </div>
                    </div>
                    <p className="text-4xl font-extrabold text-brand-accent my-4">{ad.price}</p>
                    <div className="flex gap-2">
                        <div className="bg-brand-primary/50 p-3 rounded-lg flex-grow text-center">
                            <p className="font-bold text-white">أقل كمية للطلب: <span className="text-brand-accent">{ad.min_quantity} قطعة/كرتون</span></p>
                        </div>
                         <Button
                          variant="outline"
                          onClick={handleShare}
                          className="!px-3.5"
                          aria-label="مشاركة الإعلان"
                        >
                            <ShareIcon className="w-6 h-6" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleToggleFavorite}
                          className="!px-3.5"
                          aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                        >
                            <HeartIcon className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                        </Button>
                        {!isMyAd && currentUser &&
                          <Button 
                              variant="outline"
                              onClick={handleToggleWatch}
                              className={`!px-3.5 ${isWatched ? '!border-blue-400 !text-blue-400' : ''}`}
                              aria-label={isWatched ? 'إلغاء المراقبة' : 'مراقبة الإعلان'}
                          >
                              <BinocularsIcon className={`w-6 h-6 ${isWatched ? 'fill-current' : ''}`} />
                          </Button>
                        }
                    </div>
                </div>

                {!isMyAd && !auction && (
                     <div className="bg-brand-secondary p-4 rounded-2xl space-y-3">
                         <Button onClick={handleStartChat} isLoading={isChatting} className="w-full !justify-center flex items-center gap-2">
                            بدء محادثة مع التاجر
                         </Button>
                         <Button onClick={handleStartNegotiation} variant="secondary" className="w-full flex items-center justify-center gap-2">
                            <BotIcon className="w-5 h-5"/>
                            بدء تفاوض آلي
                         </Button>
                    </div>
                )}


                {ad.price_tiers && ad.price_tiers.length > 0 && (
                  <div className="bg-brand-secondary p-6 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4">أسعار خاصة للكميات</h2>
                    <table className="w-full text-center">
                      <thead className="border-b-2 border-brand-accent/30">
                        <tr>
                          <th className="pb-2 text-brand-text-secondary font-semibold">الكمية (أكثر من)</th>
                          <th className="pb-2 text-brand-text-secondary font-semibold">السعر للقطعة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ad.price_tiers.map((tier, index) => (
                          <tr key={index} className="border-b border-gray-700/50">
                            <td className="py-3 font-bold text-brand-text">{tier.quantity}</td>
                            <td className="py-3 font-bold text-brand-accent">{tier.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {auction && (
                     <div className="bg-gradient-to-r from-red-800 to-red-600 p-6 rounded-2xl text-center shadow-lg">
                        <h2 className="text-2xl font-bold mb-2">هذا المنتج في مزاد!</h2>
                        <p className="mb-4">السعر الحالي: <span className="font-bold text-2xl">{auction.current_price.toLocaleString()} د.ع</span></p>
                        <Button onClick={() => onNavigate(`/auction/${auction.id}`)} className="w-full !bg-white !text-red-700 hover:!bg-gray-200">
                            اذهب إلى صفحة المزاد
                        </Button>
                    </div>
                )}
                
                <LogisticsEstimator ad={ad} />

                <div className="bg-brand-secondary p-6 rounded-2xl">
                     <h2 className="text-xl font-bold mb-4 border-b-2 border-brand-accent/30 pb-2">الوصف الكامل</h2>
                     <p className="text-brand-text-secondary leading-relaxed whitespace-pre-line">{ad.description}</p>
                </div>

                <div className="bg-brand-secondary p-6 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4">معلومات التاجر</h2>
                    <div className="flex items-center gap-4 mb-4">
                        <img src={user.profile_picture} alt={user.name} className="w-16 h-16 rounded-full" />
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-lg text-brand-text">{user.name}</p>
                                {user.is_verified && <VerifiedBadge className="w-5 h-5"/>}
                                {user.reputation && <SellerReputationBadge reputation={user.reputation} />}
                            </div>
                            <p className="text-sm text-brand-text-secondary">{user.store_name}</p>
                        </div>
                    </div>
                     <div className="space-y-3">
                         <Button onClick={() => onNavigate(`/profile/${user.id}`)} variant="secondary" className="w-full">
                            ملف التاجر الشخصي
                         </Button>
                         {canReview && (
                            <Button onClick={handleAddReview} variant='outline' className="w-full">
                                أضف تقييمك
                            </Button>
                         )}
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};