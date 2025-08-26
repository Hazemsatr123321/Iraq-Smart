import React, { useState, useEffect } from 'react';
import { Button } from './common/Button';
import { useAdmin } from '../contexts/AdminContext';
import { useUser } from '../contexts/UserContext';
import { estimateLogistics } from '../services/geminiService';
import { TruckIcon } from './icons/TruckIcon';
import { Ad } from '../types';

interface LogisticsEstimatorProps {
  ad: Ad;
}

export const LogisticsEstimator: React.FC<LogisticsEstimatorProps> = ({ ad }) => {
  const { provinces } = useAdmin();
  const { currentUser } = useUser();
  
  const [destination, setDestination] = useState('');
  const [result, setResult] = useState<{ cost: string; time: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (currentUser?.store_location) {
        // A simple way to get province from location string
        const userProvince = provinces.find(p => currentUser.store_location?.includes(p.name));
        if (userProvince) {
            setDestination(userProvince.name);
        }
    }
  }, [currentUser, provinces]);

  const handleEstimate = async () => {
    if (!destination) {
        alert("الرجاء اختيار محافظة الوجهة.");
        return;
    }
    setIsLoading(true);
    setResult(null);
    const estimation = await estimateLogistics(ad.province, destination, ad.category);
    setResult(estimation);
    setIsLoading(false);
  };
  
  if (currentUser?.store_location?.includes(ad.province)) {
    return null; // Don't show if user is in the same province as the ad
  }

  return (
    <div className="bg-brand-secondary p-6 rounded-2xl">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <TruckIcon className="w-6 h-6 text-brand-accent"/>
        تقدير تكاليف الشحن
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs text-brand-text-secondary">من</label>
                <p className="font-bold p-3 bg-brand-primary/50 rounded-lg">{ad.province}</p>
            </div>
             <div>
                <label htmlFor="destination" className="text-xs text-brand-text-secondary">إلى</label>
                <select 
                    id="destination" 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-brand-primary text-brand-text border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                  <option value="">-- اختر وجهة --</option>
                  {provinces.filter(p => p.name !== ad.province).map(prov => <option key={prov.id} value={prov.name}>{prov.name}</option>)}
                </select>
             </div>
        </div>
        <Button onClick={handleEstimate} disabled={isLoading || !destination} className="w-full">
            {isLoading ? 'جاري التقدير...' : 'قدّر التكلفة'}
        </Button>
        {result && (
            <div className="bg-brand-primary/50 p-4 rounded-lg mt-4 text-center animate-fadeInUp">
                <p className="text-sm text-brand-text-secondary">التكلفة التقديرية: <span className="font-bold text-brand-accent">{result.cost}</span></p>
                <p className="text-sm text-brand-text-secondary">المدة الزمنية التقديرية: <span className="font-bold text-brand-accent">{result.time}</span></p>
                <p className="text-xs text-gray-500 mt-2">*هذا التقدير هو لأغراض إرشادية فقط.</p>
            </div>
        )}
      </div>
    </div>
  );
};