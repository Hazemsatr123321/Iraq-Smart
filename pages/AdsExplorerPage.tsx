
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AdCard } from '../components/AdCard';
import { Header } from '../components/Header';
import { useAdmin } from '../contexts/AdminContext';
import { SearchIcon } from '../components/icons/SearchIcon';
import { GavelIcon } from '../components/icons/GavelIcon';
import { Button } from '../components/common/Button';
import { RadarIcon } from '../components/icons/RadarIcon';
import { EmptyState } from '../components/common/EmptyState';
import { ClipboardIcon } from '../components/icons/ClipboardIcon';
import { useUser } from '../contexts/UserContext';
import { HandHeartIcon } from '../components/icons/HandHeartIcon';
import { AdCardSkeleton } from '../components/AdCardSkeleton';
import { ArrowDownIcon } from '../components/icons/ArrowDownIcon';

const ADS_PER_PAGE = 12;

export const AdsExplorerPage: React.FC<{ 
    onNavigate: (path: string) => void,
    onOpenStockWatch: () => void,
}> = ({ onNavigate, onOpenStockWatch }) => {
  const { ads, categories, provinces, featureFlags, isDataLoaded } = useAdmin();
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: 'الكل',
    subcategory: 'الكل',
    province: 'الكل',
    minPrice: '',
    maxPrice: ''
  });

  const [visibleCount, setVisibleCount] = useState(ADS_PER_PAGE);

  useEffect(() => {
    // Set initial filters from URL params if they exist
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const q = urlParams.get('q');
    const province = urlParams.get('province');
    if (q || province) {
        setFilters(prev => ({
            ...prev,
            searchQuery: q || '',
            province: province || 'الكل'
        }));
    }
  }, []);

  const isRfqEnabled = featureFlags.find(f => f.id === 'requestForQuotation')?.is_enabled ?? false;

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setVisibleCount(ADS_PER_PAGE); // Reset pagination on filter change
  };

  const subcategories = useMemo(() => {
    if (filters.category === 'الكل') return [];
    const selected = categories.find(c => c.name === filters.category);
    return selected ? selected.subcategories : [];
  }, [filters.category, categories]);

  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      if (ad.status !== 'approved') return false;

      const { searchQuery, category, subcategory, province, minPrice, maxPrice } = filters;
      
      const queryMatch = searchQuery ? (ad.title.toLowerCase().includes(searchQuery.toLowerCase()) || ad.description.toLowerCase().includes(searchQuery.toLowerCase())) : true;
      const categoryMatch = category === 'الكل' || ad.category === category;
      const subcategoryMatch = subcategory === 'الكل' || !subcategory || ad.subcategory === subcategory;
      const provinceMatch = province === 'الكل' || ad.province === province;
      
      const price = parseFloat(ad.price.replace(/[^0-9]/g, ''));
      const minPriceNum = minPrice ? parseFloat(minPrice) : 0;
      const maxPriceNum = maxPrice ? parseFloat(maxPrice) : Infinity;
      const priceMatch = !isNaN(price) ? (price >= minPriceNum && price <= maxPriceNum) : true;

      return queryMatch && categoryMatch && subcategoryMatch && provinceMatch && priceMatch;
    }).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [ads, filters]);

  const visibleAds = useMemo(() => filteredAds.slice(0, visibleCount), [filteredAds, visibleCount]);
  const hasMore = visibleCount < filteredAds.length;

  return (
    <div className="min-h-screen text-brand-text bg-brand-primary flex flex-col">
      <Header variant="page" title="تصفح الإعلانات" onBack={() => onNavigate('/')} onNavigate={onNavigate} />

      <main 
        className="container mx-auto p-4 pb-24 flex-grow overflow-y-auto"
      >
        {/* Filters Section */}
        <div className="bg-brand-secondary/80 backdrop-blur-md p-4 rounded-2xl mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              name="searchQuery"
              value={filters.searchQuery}
              onChange={handleFilterChange}
              placeholder="ابحث بالاسم أو الوصف..."
              className="w-full bg-brand-primary text-brand-text placeholder-brand-text-secondary border border-gray-600 rounded-lg py-3 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-text-secondary">
              <SearchIcon className="h-5 w-5"/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full bg-brand-primary text-brand-text border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent">
              <option value="الكل">كل الفئات</option>
              {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
            <select name="province" value={filters.province} onChange={handleFilterChange} className="w-full bg-brand-primary text-brand-text border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent">
              <option value="الكل">كل المحافظات</option>
              {provinces.map(prov => <option key={prov.id} value={prov.name}>{prov.name}</option>)}
            </select>
             <Button onClick={onOpenStockWatch} variant="secondary" className="w-full flex items-center justify-center gap-2">
                <RadarIcon className="h-5 w-5" />
                <span>إنشاء رادار سوق</span>
            </Button>
          </div>
           <div className="flex justify-end pt-2 gap-4 flex-wrap">
              <Button onClick={() => onNavigate('/social-support')} variant="outline" className="!py-2 !px-4 !border-blue-500 !text-blue-400 hover:!bg-blue-500 hover:!text-white flex items-center justify-center gap-2">
                  <HandHeartIcon className="h-5 w-5" />
                  <span>دعم الخير والمشاريع</span>
              </Button>
             {isRfqEnabled && (
                <Button onClick={() => onNavigate('/rfqs')} variant="outline" className="!py-2 !px-4 !border-cyan-500 !text-cyan-400 hover:!bg-cyan-500 hover:!text-white flex items-center justify-center gap-2">
                    <ClipboardIcon className="h-5 w-5" />
                    <span>طلبات عروض الأسعار</span>
                </Button>
              )}
             <Button onClick={() => onNavigate('/auctions')} variant="outline" className="!py-2 !px-4 !border-red-500 !text-red-400 hover:!bg-red-500 hover:!text-white flex items-center justify-center gap-2">
              <GavelIcon className="h-5 w-5" />
              <span>عرض المزادات</span>
            </Button>
          </div>
        </div>

        {/* Ads Grid */}
        {!isDataLoaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => <AdCardSkeleton key={index} />)}
          </div>
        ) : visibleAds.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleAds.map((ad, index) => (
                 <div key={ad.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 50}ms`}}>
                    <AdCard ad={ad} onClick={() => onNavigate(`/ad/${ad.id}`)} />
                 </div>
              ))}
            </div>
             {hasMore && (
                <div className="text-center mt-8">
                    <Button onClick={() => setVisibleCount(c => c + ADS_PER_PAGE)} variant="secondary">
                        تحميل المزيد
                    </Button>
                </div>
             )}
          </>
        ) : (
          <div className="col-span-full py-16">
            <EmptyState
              icon={<SearchIcon />}
              title="لا توجد نتائج"
              message="لم نعثر على أي إعلانات تطابق بحثك الحالي. حاول تعديل الفلاتر أو البحث عن شيء آخر."
            />
          </div>
        )}
      </main>
    </div>
  );
};
