import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useUser } from '../../contexts/UserContext';
import { TrashIcon } from '../icons/TrashIcon';
import { EmptyState } from '../common/EmptyState';
import { RadarIcon } from '../icons/RadarIcon';
import { Button } from '../common/Button';

export const StockWatchList: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useUser();
  const { getStockWatchesForUser, deleteStockWatch } = useAdmin();

  if (!currentUser) return null;

  const userStockWatches = getStockWatchesForUser(currentUser.id);

  const handleDelete = (watchId: string) => {
    window.dispatchEvent(new CustomEvent('show-confirm', {
        detail: {
            title: 'حذف الرادار',
            message: 'هل أنت متأكد من حذف هذا الرادار؟',
            onConfirm: async () => {
                await deleteStockWatch(watchId);
            },
        }
    }));
  };

  if (userStockWatches.length === 0) {
    return (
      <div className="py-16">
        <EmptyState
            icon={<RadarIcon />}
            title="ليس لديك أي رادار فعال"
            message="استخدم رادار السوق لتلقي إشعارات فورية عند نشر إعلانات تهمك."
        >
            <Button onClick={() => onNavigate('/ads')} className="mt-6">
                اذهب لتصفح الإعلانات وأنشئ رادارك الأول
            </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {userStockWatches.map(watch => (
        <div key={watch.id} className="bg-brand-secondary p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-bold text-lg text-brand-text">"{watch.keywords}"</p>
            <div className="flex gap-4 text-sm text-brand-text-secondary mt-1">
              <span>الفئة: {watch.category}</span>
              <span>المحافظة: {watch.province}</span>
            </div>
          </div>
          <button 
            onClick={() => handleDelete(watch.id)} 
            className="text-red-500 hover:text-red-400 p-2 rounded-full"
            title="حذف الرادار"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};
