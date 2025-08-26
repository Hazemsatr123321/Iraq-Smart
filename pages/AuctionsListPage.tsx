
import React from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { Header } from '../components/Header';
import { AuctionCard } from '../components/AuctionCard';

export const AuctionsListPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { auctions, ads, users } = useAdmin();

  const activeAuctions = auctions.filter(a => a.status === 'active');

  return (
    <div className="min-h-screen bg-brand-primary text-brand-text">
      <Header variant="page" title="مزادات الجملة" onBack={() => onNavigate('/')} onNavigate={onNavigate} />
      <main className="container mx-auto p-4 pb-24">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gradient-gold">المزادات الفعالة</h1>
          <p className="text-brand-text-secondary mt-2">تنافس للحصول على أفضل الصفقات. الوقت ينفد!</p>
        </div>
        
        {activeAuctions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeAuctions.map(auction => {
              const ad = ads.find(a => a.id === auction.ad_id);
              if (!ad) return null;
              const seller = users.find(u => u.id === ad.user_id);
              return (
                <div key={auction.id} className="animate-fadeInUp" style={{animationDelay: `${auction.id.slice(-1)}0ms`}}>
                    <AuctionCard
                        ad={ad}
                        auction={auction}
                        seller={seller}
                        onClick={() => onNavigate(`/auction/${auction.id}`)}
                    />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-brand-secondary rounded-2xl">
            <p className="text-xl text-brand-text-secondary">لا توجد مزادات فعالة حالياً.</p>
            <p className="mt-2 text-sm text-gray-500">تفقد هذه الصفحة لاحقاً للمشاركة في المزادات القادمة.</p>
          </div>
        )}
      </main>
    </div>
  );
};