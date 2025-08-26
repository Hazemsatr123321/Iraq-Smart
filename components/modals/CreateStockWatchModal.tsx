
import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAdmin } from '../../contexts/AdminContext';
import type { StockWatch } from '../../types';

interface CreateStockWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (watchData: Omit<StockWatch, 'id' | 'user_id'>) => void;
}

export const CreateStockWatchModal: React.FC<CreateStockWatchModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { categories, provinces } = useAdmin();
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('الكل');
  const [province, setProvince] = useState('الكل');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim()) {
      setError('الرجاء إدخال كلمة مفتاحية واحدة على الأقل.');
      return;
    }
    setError('');
    onSubmit({ keywords, category, province });
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-md p-6 border border-brand-secondary" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-text text-center">إنشاء رادار سوق جديد</h2>
        <p className="text-center text-brand-text-secondary mb-6">سنقوم بإعلامك فوراً عند نشر إعلانات جديدة تطابق بحثك.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                label="الكلمات المفتاحية"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="مثال: ملابس اطفال تركية"
                required
            />
            <div>
                <label htmlFor="category-watch" className="block text-brand-text-secondary text-sm font-bold mb-2">الفئة (اختياري)</label>
                <select id="category-watch" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-brand-secondary text-brand-text border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent">
                    <option value="الكل">كل الفئات</option>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="province-watch" className="block text-brand-text-secondary text-sm font-bold mb-2">المحافظة (اختياري)</label>
                <select id="province-watch" value={province} onChange={(e) => setProvince(e.target.value)} className="w-full bg-brand-secondary text-brand-text border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent">
                    <option value="الكل">كل المحافظات</option>
                    {provinces.map(prov => <option key={prov.id} value={prov.name}>{prov.name}</option>)}
                </select>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
             <div className="mt-6 flex gap-4">
                <Button type="submit" className="w-full">إنشاء الرادار</Button>
                <Button onClick={onClose} variant="secondary" className="w-full">إلغاء</Button>
            </div>
        </form>
      </div>
    </div>
  );
};