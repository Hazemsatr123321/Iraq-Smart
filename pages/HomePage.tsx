
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import type { User, Ad, Campaign } from '../types';
import { useAdmin } from '../contexts/AdminContext';
import { FeaturedAdCard } from '../components/FeaturedAdCard';
import { useUser } from '../contexts/UserContext';
import { PersonalizedOfferCard } from '../components/PersonalizedOfferCard';
import { AuctionCard } from '../components/AuctionCard';
import { ExternalAdCard } from '../components/ExternalAdCard';
import { ZapIcon } from '../components/icons/ZapIcon';
import { FullScreenLoader } from '../components/common/FullScreenLoader';
import { Button } from '../components/common/Button';
import { AdCard } from '../components/AdCard';
import { CampaignCard } from '../components/CampaignCard';
import { HandHeartIcon } from '../components/icons/HandHeartIcon';
import { RibbonIcon } from '../components/icons/RibbonIcon';

const Countdown: React.FC<{ endTime: string, onEnd: () => void }> = ({ endTime, onEnd }) => {
    const calculateTimeLeft = useCallback(() => {
        const difference = +new Date(endTime) - +new Date();
        let timeLeft: { [key: string]: number } = {};
        if (difference > 0) {
            timeLeft = {
                ساعات: Math.floor((difference / (1000 * 60 * 60)) % 24),
                دقائق: Math.floor((difference / 1000 / 60) % 60),
                ثواني: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    }, [endTime]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            if (Object.keys(newTimeLeft).length === 0) {
                onEnd();
                clearInterval(timer);
            } else {
                setTimeLeft(newTimeLeft);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [calculateTimeLeft, onEnd]);

    return (
        <div className="flex justify-center gap-1.5 text-xs font-mono">
            {Object.entries(timeLeft).map(([interval, value]) => (
                <div key={interval} className="flex flex-col items-center bg-red-900/50 px-2 py-1 rounded">
                    <span className="font-bold">{value.toString().padStart(2, '0')}</span>
                    <span className="text-red-300/70">{interval.slice(0, 1)}</span>
                </div>
            ))}
        </div>
    );
};

export const HomePage: React.FC<{ 
    onNavigate: (path: string) => void,
}> = ({ onNavigate }) => {
  const { ads, users, settings, personalizedOffers, auctions, externalAds, campaigns } = useAdmin();
  const { currentUser } = useUser();
  const [renderTrigger, setRenderTrigger] = useState(0);
  
  const handleCountdownEnd = useCallback(() => {
    setRenderTrigger(Date.now());
  }, []);

  const activeFlashDeals = useMemo(() => 
    ads.filter(ad => ad.flash_deal?.is_active && new Date(ad.flash_deal.end_time) > new Date()), 
    [ads, renderTrigger]
  );
  
  const featuredAds = useMemo(() => ads.filter(ad => ad.featured && ad.status === 'approved' && !ad.auction_id), [ads]);
  const activeAuctions = useMemo(() => auctions.filter(a => a.status === 'active'), [auctions]);
  const activeExternalAds = useMemo(() => externalAds.filter(ad => ad.is_active), [externalAds]);
  
  const charitableAds = useMemo(() => ads.filter(ad => ad.is_charitable && ad.status === 'approved'), [ads]);
  const activeCampaigns = useMemo(() => campaigns.filter(c => c.is_active), [campaigns]);
  
  const userPersonalizedOffers = useMemo(() => {
    if (!currentUser) return [];
    // In a real app, this would be more complex, targeting specific user interests.
    // For this mock, we'll just show all available offers to any logged-in user.
    return personalizedOffers;
  }, [personalizedOffers, currentUser]);

  const getUserForAd = (userId: string): User | undefined => {
    return users.find(u => u.id === userId);
  }
  
  return (
    <div className="min-h-screen text-brand-text luxury-homepage-bg">
       <div className="relative pt-24 md:pt-32">
         
         <Header onNavigate={onNavigate} />

          <main className="container mx-auto p-4 pb-24">
            <div className="text-center pb-16 md:pb-24 px-4">
              <h1 className="text-4xl md:text-6xl font-extrabold text-gradient-gold animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                سوق الجملة الأول في العراق
              </h1>
              <p className="mt-4 text-lg md:text-xl text-brand-text-secondary max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '300ms' }}>
                منصة تجمع كبار تجار الجملة مع أصحاب المحلات، مدعومة بالذكاء الاصطناعي لصفقات أذكى وأسرع.
              </p>
            </div>

            <div className="space-y-16">
            
              {activeExternalAds.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {activeExternalAds.map((ad, index) => (
                    <div key={ad.id} className="animate-slideIn" style={{ animationDelay: `${500 + index * 100}ms` }}>
                      <ExternalAdCard ad={ad} />
                    </div>
                  ))}
                </div>
              )}
              
              {(activeCampaigns.length > 0 || charitableAds.length > 0) && (
                 <div className="social-support-bg rounded-2xl p-6 md:p-8 border border-brand-accent/20">
                  <h2 className="text-3xl font-bold text-center text-gradient-gold mb-10 animate-fadeInUp flex items-center justify-center gap-3" style={{ animationDelay: '600ms' }}>
                    <HandHeartIcon className="w-8 h-8"/> مبادرات الخير والدعم
                  </h2>

                  {activeCampaigns.length > 0 && (
                    <div className="mb-12 animate-fadeInUp" style={{ animationDelay: '700ms' }}>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-brand-text flex items-center gap-3">
                          <RibbonIcon className="w-7 h-7 text-brand-accent"/> حملات إنسانية
                        </h3>
                        {activeCampaigns.length > 3 && (
                          <Button onClick={() => onNavigate('/social-support')} variant='outline'>عرض الكل</Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activeCampaigns.slice(0, 3).map((campaign, index) => (
                          <div key={campaign.id} className="animate-slideIn" style={{ animationDelay: `${800 + index * 100}ms` }}>
                            <CampaignCard campaign={campaign} onDonate={() => onNavigate('/social-support')} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {charitableAds.length > 0 && (
                    <div className="animate-fadeInUp" style={{ animationDelay: '900ms' }}>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-brand-text flex items-center gap-3">
                           <HandHeartIcon className="w-7 h-7 text-brand-accent"/> دعم الأسر المتعففة
                        </h3>
                         {charitableAds.length > 3 && (
                          <Button onClick={() => onNavigate('/social-support')} variant='outline'>عرض الكل</Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {charitableAds.slice(0, 3).map((ad, index) => (
                          <div key={ad.id} className="animate-slideIn" style={{ animationDelay: `${1000 + index * 100}ms` }}>
                            <AdCard ad={ad} onClick={() => onNavigate(`/ad/${ad.id}`)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                 </div>
              )}
              
               {activeFlashDeals.length > 0 && (
                 <div>
                  <h2 className="text-3xl font-bold text-center text-red-400 mb-8 animate-fadeInUp flex items-center justify-center gap-3" style={{ animationDelay: '600ms' }}>
                    <ZapIcon className="w-8 h-8"/> صفقات البرق
                  </h2>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                     {activeFlashDeals.map((ad, index) => (
                       <div key={ad.id} className="animate-slideIn" style={{ animationDelay: `${700 + index * 100}ms` }}>
                         <div className="relative">
                           <FeaturedAdCard ad={ad} seller={getUserForAd(ad.user_id)} onClick={() => onNavigate(`/ad/${ad.id}`)} />
                           <div className="absolute top-4 right-4 z-20">
                             <Countdown endTime={ad.flash_deal!.end_time} onEnd={handleCountdownEnd} />
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

              {currentUser && userPersonalizedOffers.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold text-center text-brand-text mb-8 animate-fadeInUp" style={{ animationDelay: '700ms' }}>عروض خاصة لك</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {userPersonalizedOffers.map((offer, index) => {
                      const ad = ads.find(a => a.id === offer.ad_id);
                      if (!ad) return null;
                      return (
                        <div key={offer.id} className="animate-slideIn" style={{ animationDelay: `${800 + index * 100}ms` }}>
                          <PersonalizedOfferCard ad={ad} offer={offer} onClick={() => onNavigate(`/ad/${ad.id}`)} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeAuctions.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold text-center text-brand-text mb-8 animate-fadeInUp" style={{ animationDelay: '900ms' }}>مزادات فعالة الآن</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {activeAuctions.slice(0, 3).map((auction, index) => {
                       const ad = ads.find(a => a.id === auction.ad_id);
                       if(!ad) return null;
                       const seller = getUserForAd(ad.user_id);
                      return (
                        <div key={auction.id} className="animate-slideIn" style={{ animationDelay: `${1000 + index * 100}ms` }}>
                         <AuctionCard ad={ad} auction={auction} seller={seller} onClick={() => onNavigate(`/auction/${auction.id}`)} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
                
                { featuredAds.length > 0 &&
                  <div>
                      <h2 className="text-3xl font-bold text-center text-brand-text mb-8 animate-fadeInUp" style={{ animationDelay: '1100ms' }}>الإعلانات المميزة</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                          {featuredAds.map((ad, index) => (
                              <div key={ad.id} className="animate-slideIn" style={{ animationDelay: `${1200 + index * 100}ms` }}>
                                <FeaturedAdCard 
                                  ad={ad} 
                                  seller={getUserForAd(ad.user_id)}
                                  onClick={() => onNavigate(`/ad/${ad.id}`)} 
                                />
                              </div>
                          ))}
                      </div>
                  </div>
                }
                
                 {settings?.google_ads_enabled && (
                   <div className="col-span-full bg-brand-secondary/30 rounded-lg flex items-center justify-center h-24 text-brand-text-secondary animate-fadeInUp" style={{ animationDelay: '1300ms' }}>
                      (مساحة إعلانية لـ Google AdMob Banner)
                  </div>
                )}
            </div>
          </main>
      </div>
    </div>
  );
};
