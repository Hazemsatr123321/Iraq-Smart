import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAdmin } from '../contexts/AdminContext';
import { RequestForQuotation, ToastType } from '../types';
import { useUser } from '../contexts/UserContext';

export const PostRFQPage: React.FC<{
  onNavigate: (path: string) => void,
  addToast: (message: string, type?: ToastType) => void,
}> = ({ onNavigate, addToast }) => {
  const { categories, provinces, addRfq } = useAdmin();
  const { currentUser } = useUser();
  const [formData, setFormData] = useState<Omit<RequestForQuotation, 'id' | 'user_id' | 'timestamp' | 'status'>>({
    product_name: '',
    category: '',
    quantity: 1,
    details: '',
    province: provinces.length > 0 ? provinces[0].name : ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({ ...prev, [id]: type === 'number' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !currentUser) return;

    if (!formData.product_name || !formData.category || formData.quantity <= 0 || !formData.details) {
        addToast('يرجى ملء جميع الحقول بشكل صحيح.', 'error');
        return;
    }
    
    setIsSubmitting(true);
    try {
        await addRfq(formData, currentUser.id);
        addToast('تم نشر طلبك بنجاح! سيتم إعلامك عند وصول العروض.', 'success');
        onNavigate('/rfqs');
    } catch(error) {
        console.error("Error creating RFQ:", error);
        addToast('حدث خطأ أثناء نشر طلبك. حاول مرة أخرى.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-primary min-h-screen text-brand-text">
      <Header variant="page" title="نشر طلب عرض سعر" onBack={() => onNavigate('/rfqs')} />

      <main className="container mx-auto p-4 pb-24">
        <div className="bg-brand-secondary max-w-2xl mx-auto p-8 rounded-2xl shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gradient-gold">ما الذي تبحث عنه؟</h2>
            <p className="text-brand-text-secondary mt-2">صف المنتج الذي تحتاجه، ودع تجار الجملة يتنافسون لتقديم أفضل سعر لك.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="اسم المنتج المطلوب" id="product_name" value={formData.product_name} onChange={handleInputChange} placeholder="مثال: زيت طبخ عافية حجم 1 لتر" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Input label="الكمية المطلوبة (قطعة/كرتون)" id="quantity" type="number" value={String(formData.quantity)} onChange={handleInputChange} min="1" required />
               <div>
                  <label htmlFor="category" className="block text-brand-text-secondary text-sm font-bold mb-2">الفئة الرئيسية</label>
                  <select id="category" value={formData.category} onChange={handleInputChange} className="w-full bg-brand-primary text-brand-text border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent" required>
                    <option value="">-- اختر فئة --</option>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
               </div>
            </div>
             <div>
                <label htmlFor="province" className="block text-brand-text-secondary text-sm font-bold mb-2">المحافظة التي تتواجد بها</label>
                <select id="province" value={formData.province} onChange={handleInputChange} className="w-full bg-brand-primary text-brand-text border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent" required>
                  {provinces.map(prov => <option key={prov.id} value={prov.name}>{prov.name}</option>)}
                </select>
             </div>
             <div>
              <label htmlFor="details" className="block text-brand-text-secondary text-sm font-bold mb-2">تفاصيل إضافية</label>
              <textarea id="details" value={formData.details} onChange={handleInputChange} rows={4} className="w-full bg-brand-primary text-brand-text placeholder-brand-text-secondary border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="اذكر أي تفاصيل مهمة (مثل بلد الصنع، مواصفات خاصة، إلخ...)" required></textarea>
            </div>
            
            <div className="pt-4">
               <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'جاري النشر...' : 'نشر الطلب'}
               </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};