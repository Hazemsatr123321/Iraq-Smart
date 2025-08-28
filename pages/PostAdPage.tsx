
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/Header';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { Stepper } from '../components/common/Stepper';
import { useAdmin } from '../contexts/AdminContext';
import { UploadIcon } from '../components/icons/UploadIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { Ad, ToastType, PriceTier } from '../types';
import { useUser } from '../contexts/UserContext';
import { PlusIcon } from '../components/icons/PlusIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { StarIcon } from '../components/icons/StarIcon';
import { HandHeartIcon } from '../components/icons/HandHeartIcon';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { uploadAdImage, deleteAdImage } from '../services/storageService';
import { FeatureAdForm } from '../components/common/FeatureAdForm';

const STEPS = ['التفاصيل', 'البيع', 'الصور', 'المراجعة'];

export const PostAdPage: React.FC<{
  onNavigate: (path: string) => void,
  onOpenAI: (mode: any) => void,
  onAdGenerated: (content: {title: string, description: string}) => void,
  adContent: {title: string, description: string},
  addToast: (message: string, type?: ToastType) => void,
  adIdToEdit?: string,
}> = ({ onNavigate, onOpenAI, onAdGenerated, adContent, addToast, adIdToEdit }) => {
  const { categories, provinces, addAd, getAdById, updateAd, createAuction, settings } = useAdmin();
  const { currentUser } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!adIdToEdit;
  const existingAd = useMemo(() => isEditMode ? getAdById(adIdToEdit) : undefined, [adIdToEdit, getAdById, isEditMode]);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Ad>>({
    title: '',
    description: '',
    price: '',
    min_quantity: 1,
    category: '',
    subcategory: '',
    province: provinces.length > 0 ? provinces[0].name : '',
    images: [] as string[],
    price_tiers: [] as PriceTier[],
    ai_quality_verification_status: 'none',
    is_charitable: false,
  });
  
  const [imageFiles, setImageFiles] = useState<Map<string, File>>(new Map());

  const [isAuction, setIsAuction] = useState(false);
  const [auctionStartPrice, setAuctionStartPrice] = useState('');
  const [priceTiers, setPriceTiers] = useState<{ quantity: string, price: string }[]>([{ quantity: '', price: '' }]);
  const [adJustCreated, setAdJustCreated] = useState<Ad | null>(null);

  useEffect(() => {
    if (!currentUser) {
      onNavigate('/auth');
    }
  }, [currentUser, onNavigate]);

  useEffect(() => {
    if (isEditMode && existingAd) {
      if(currentUser?.id !== existingAd.user_id && currentUser?.role !== 'admin') {
          addToast('لا تملك صلاحية تعديل هذا الإعلان.', 'error');
          onNavigate('/');
          return;
      }
      setFormData(existingAd);
      setPriceTiers((existingAd.price_tiers || []).map(pt => ({ quantity: String(pt.quantity), price: pt.price })));
      if(existingAd.auction_id) setIsAuction(true);
    }
  }, [isEditMode, existingAd, currentUser, onNavigate, addToast]);

  useEffect(() => {
    if (adContent.title || adContent.description) {
      setFormData(prev => ({...prev, title: adContent.title, description: adContent.description}));
    }
  }, [adContent]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    // @ts-ignore
    const checked = e.target.checked;
    
    if (id === 'requestAiVerification') {
        setFormData(prev => ({ ...prev, ai_quality_verification_status: checked ? 'pending' : 'none' }));
    } else if (id === 'isCharitable') {
        setFormData(prev => ({ ...prev, is_charitable: checked }));
    } else {
        setFormData(prev => ({ ...prev, [id]: value }));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if ((formData.images?.length || 0) + newFiles.length > 5) {
        addToast('يمكنك رفع 5 صور كحد أقصى.', 'error');
        return;
      }
      
      const newImagePreviews = new Map(imageFiles);
      const newImageUrls: string[] = [...(formData.images || [])];

      for(const file of newFiles) {
        const previewUrl = URL.createObjectURL(file);
        newImageUrls.push(previewUrl);
        newImagePreviews.set(previewUrl, file);
      }
      
      setFormData(prev => ({...prev, images: newImageUrls}));
      setImageFiles(newImagePreviews);
    }
  };

  const removeImage = async (indexToRemove: number) => {
    if (!formData.images) return;
    const imageUrlToRemove = formData.images[indexToRemove];
    
    // Optimistically remove from local state
    const updatedImages = formData.images.filter((_, i) => i !== indexToRemove);
    setFormData(prev => ({ ...prev, images: updatedImages }));

    if (imageUrlToRemove.startsWith('blob:')) {
      // It's a new, unsaved image
      URL.revokeObjectURL(imageUrlToRemove);
      const newImageFiles = new Map(imageFiles);
      newImageFiles.delete(imageUrlToRemove);
      setImageFiles(newImageFiles);
    } else {
      // It's an existing image from storage
      await deleteAdImage(imageUrlToRemove);
    }
  }

  const subcategories = useMemo(() => {
    const selected = categories.find(c => c.name === formData.category);
    return selected ? selected.subcategories : [];
  }, [formData.category, categories]);

  const handlePriceTierChange = (index: number, field: 'quantity' | 'price', value: string) => {
    const newTiers = [...priceTiers];
    newTiers[index][field] = value;
    setPriceTiers(newTiers);
  };
  const addPriceTier = () => { if (priceTiers.length < 3) { setPriceTiers([...priceTiers, { quantity: '', price: '' }]); } };
  const removePriceTier = (index: number) => { setPriceTiers(priceTiers.filter((_, i) => i !== index)); };

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  
  const handleBack = () => {
    if (isSubmitting) return;
    if (step > 1) { prevStep(); } 
    else { onNavigate(isEditMode && currentUser ? `/profile/${currentUser.id}` : '/'); }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !currentUser) return;
    if (!['wholesaler', 'admin', 'retailer'].includes(currentUser.role)) {
      addToast("فقط المستخدمين المصرح لهم يمكنهم إضافة إعلانات.", 'error');
      return;
    }
    setIsSubmitting(true);
    try {
        if (!formData.images || formData.images.length === 0) {
            addToast("الرجاء إضافة صورة واحدة على الأقل للإعلان.", 'error');
            setIsSubmitting(false);
            return;
        }

        // Upload new images (the ones that are blob URLs)
        const uploadPromises = Array.from(imageFiles.entries())
            .map(([previewUrl, file]) => uploadAdImage(file, currentUser.id));

        const newImageUrls = await Promise.all(uploadPromises);

        // Combine old images (non-blob) with new ones
        const existingImageUrls = (formData.images || []).filter(url => !url.startsWith('blob:'));
        const finalImageUrls = [...existingImageUrls, ...newImageUrls];

        const finalPrice = isAuction ? `يبدأ من ${auctionStartPrice} د.ع` : formData.price;
        const finalPriceTiers = priceTiers.filter(pt => pt.quantity && pt.price).map(pt => ({ quantity: Number(pt.quantity), price: pt.price }));
        const adDataForSubmission = { ...formData, price: finalPrice, images: finalImageUrls, price_tiers: finalPriceTiers.length > 0 ? finalPriceTiers : undefined };
    
        if (isEditMode && adIdToEdit) {
            const { id, ...updatePayload } = adDataForSubmission;
            await updateAd(adIdToEdit, updatePayload);
            addToast('تم إرسال التعديلات للمراجعة بنجاح!');
            onNavigate(`/profile/${currentUser.id}?tab=myAds`);
        } else {
            const newAd = await addAd(adDataForSubmission as Omit<Ad, 'id' | 'user_id' | 'featured' | 'status' | 'views' | 'saves'>, currentUser.id);
            if (isAuction) {
                await createAuction(newAd.id, parseFloat(auctionStartPrice), 24);
            }
            addToast('تم إرسال إعلانك للمراجعة بنجاح!');
            setAdJustCreated(newAd); // Stay on page to show feature options
        }
    } catch (error) {
        console.error("Error submitting ad:", error);
        addToast(error instanceof Error ? error.message : "حدث خطأ أثناء إرسال الإعلان.", 'error');
    } finally {
        setIsSubmitting(false);
    }
  };
  
   const pageTitle = isEditMode ? 'تعديل الإعلان' : 'إضافة إعلان جديد';
  
  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
             <h3 className="text-xl font-bold text-brand-text -mb-2">أولاً: التفاصيل الأساسية</h3>
             <p className="text-sm text-brand-text-secondary">اكتب عنواناً جذاباً ووصفاً دقيقاً لمنتجك.</p>
             <div>
              <label className="block text-brand-text-secondary text-sm font-bold mb-2">عنوان الإعلان</label>
              <div className="relative">
                 <Input id="title" value={formData.title} onChange={handleInputChange} type="text" placeholder="مثال: تمر زاهدي عراقي درجة أولى" required />
                 <button type="button" onClick={() => onOpenAI('ad_creation')} className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-accent hover:text-yellow-300" title="مساعدة بالذكاء الاصطناعي">
                    <SparklesIcon className="w-5 h-5" />
                 </button>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-brand-text-secondary text-sm font-bold mb-2">وصف المنتج</label>
              <textarea id="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full bg-brand-primary text-brand-text placeholder-brand-text-secondary border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="اذكر كل التفاصيل المهمة عن المنتج..." required></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label htmlFor="category" className="block text-brand-text-secondary text-sm font-bold mb-2">الفئة الرئيسية</label>
                  <select id="category" value={formData.category} onChange={handleInputChange} className="w-full bg-brand-primary text-brand-text border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent" required>
                    <option value="">-- اختر فئة --</option>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
               </div>
               <div>
                  <label htmlFor="subcategory" className="block text-brand-text-secondary text-sm font-bold mb-2">الفئة الفرعية</label>
                  <select id="subcategory" value={formData.subcategory} onChange={handleInputChange} className="w-full bg-brand-primary text-brand-text border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent" disabled={subcategories.length === 0}>
                    <option value="">-- اختر فئة فرعية --</option>
                    {subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
               </div>
            </div>
            {formData.category === 'مواد غذائية' && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="bg-blue-900/30 p-4 rounded-lg border-2 border-blue-600/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <HandHeartIcon className="w-10 h-10 text-blue-400 flex-shrink-0"/>
                        <div>
                            <h4 className="font-bold text-lg text-white">المشاركة في حملة دعم الفقراء</h4>
                            <p className="text-sm text-blue-300/80">ساهم في الخير عبر توزيع نسبة صغيرة من بضاعتك مجاناً.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="isCharitable" checked={!!formData.is_charitable} onChange={handleInputChange} className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 max-w-lg mx-auto">
             <h3 className="text-xl font-bold text-brand-text -mb-2">ثانياً: طريقة البيع</h3>
             <p className="text-sm text-brand-text-secondary">اختر طريقة البيع: سعر ثابت أو مزاد.</p>
             <div className="flex gap-4 bg-brand-primary p-2 rounded-lg">
                <button type="button" onClick={() => setIsAuction(false)} className={`w-full p-3 rounded-md font-bold transition-colors ${!isAuction ? 'bg-brand-accent text-brand-primary' : 'bg-transparent text-brand-text'}`}>سعر ثابت</button>
                <button type="button" onClick={() => setIsAuction(true)} className={`w-full p-3 rounded-md font-bold transition-colors ${isAuction ? 'bg-brand-accent text-brand-primary' : 'bg-transparent text-brand-text'}`}>عرض كمزاد</button>
             </div>
             {isAuction ? (
                 <Input label="السعر الابتدائي للمزاد (د.ع)" id="auctionStartPrice" type="number" value={auctionStartPrice} onChange={e => setAuctionStartPrice(e.target.value)} placeholder="مثال: 20000" required />
             ) : (
                <Input label="السعر" id="price" type="text" value={formData.price} onChange={handleInputChange} placeholder="مثال: 25,000 دينار / كارتون" required />
             )}
             <Input label="أقل كمية للطلب" id="min_quantity" type="number" value={String(formData.min_quantity)} onChange={handleInputChange} placeholder="مثال: 50" required />
             {!isAuction && (
                <div className="space-y-4 pt-4 border-t border-gray-700">
                    <h4 className="font-bold text-brand-text">أسعار الشرائح (اختياري)</h4>
                    <p className="text-xs text-brand-text-secondary -mt-2">شجع المشترين على طلب كميات أكبر عبر تقديم أسعار أفضل.</p>
                    {priceTiers.map((tier, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input type="number" placeholder="الكمية (مثال: 100)" value={tier.quantity} onChange={(e) => handlePriceTierChange(index, 'quantity', e.target.value)} />
                            <Input type="text" placeholder="السعر (مثال: 23,000 د.ع)" value={tier.price} onChange={(e) => handlePriceTierChange(index, 'price', e.target.value)} />
                            <button type="button" onClick={() => removePriceTier(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                    {priceTiers.length < 3 && <Button type="button" variant="secondary" onClick={addPriceTier} className="w-full !py-2 flex items-center justify-center gap-2"><PlusIcon className="w-5 h-5"/> إضافة شريحة سعر</Button>}
                </div>
            )}
             <div>
                <label htmlFor="province" className="block text-brand-text-secondary text-sm font-bold mb-2">المحافظة</label>
                <select id="province" value={formData.province} onChange={handleInputChange} className="w-full bg-brand-primary text-brand-text border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent" required>
                  {provinces.map(prov => <option key={prov.id} value={prov.name}>{prov.name}</option>)}
                </select>
             </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-xl font-bold text-brand-text">ثالثاً: الصور والتوثيق</h3>
            <p className="text-sm text-brand-text-secondary mb-4">أضف صوراً واضحة للمنتج (5 كحد أقصى). الصورة الأولى هي الأساسية.</p>
            <label className={`border-2 border-dashed border-gray-600 rounded-lg p-6 text-center transition-colors block cursor-pointer hover:border-brand-accent bg-brand-primary/50`}>
              <UploadIcon className="w-12 h-12 mx-auto text-brand-text-secondary"/>
              <p className="text-brand-text-secondary mt-2">اسحب وأفلت الصور هنا، أو انقر للاختيار</p>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            {formData.images && formData.images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {formData.images.map((imgSrc, index) => (
                  <div key={index} className="relative group">
                    <img src={imgSrc} alt={`preview ${index}`} className="w-full h-28 object-cover rounded-lg"/>
                    {index === 0 && <div className="absolute top-1 left-1 bg-brand-accent text-brand-primary text-xs font-bold px-2 py-0.5 rounded-full">أساسية</div>}
                    <button onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TrashIcon className="w-4 h-4"/>
                    </button>
                  </div>
                ))}
              </div>
            )}
             <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-xl font-bold text-brand-text flex items-center gap-2"><ShieldCheckIcon className="w-6 h-6 text-brand-accent"/> ختم الجودة الذكي (اختياري)</h3>
                <p className="text-sm text-brand-text-secondary mb-4">احصل على شارة مميزة تزيد ثقة المشترين بمنتجك عبر تحليل جودته بواسطة الذكاء الاصطناعي.</p>
                <div className="bg-brand-primary/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <label htmlFor="requestAiVerification" className="font-bold text-lg text-white cursor-pointer">
                            طلب ختم الجودة الذكي
                        </label>
                        <input type="checkbox" id="requestAiVerification" checked={formData.ai_quality_verification_status === 'pending'} onChange={handleInputChange} className="w-5 h-5 text-brand-accent bg-gray-700 border-gray-600 rounded focus:ring-brand-accent" />
                    </div>
                </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-brand-text">أخيراً: المراجعة والنشر</h3>
             <p className="text-sm text-brand-text-secondary mb-4">تأكد من أن جميع المعلومات صحيحة قبل الإرسال للمراجعة.</p>
            <div className="bg-brand-primary/50 p-4 rounded-lg space-y-2 border border-gray-700">
              <p><span className="font-semibold text-brand-text-secondary">العنوان:</span> {formData.title}</p>
              <p><span className="font-semibold text-brand-text-secondary">السعر:</span> {isAuction ? `يبدأ من ${auctionStartPrice} د.ع (مزاد)` : formData.price}</p>
              <p><span className="font-semibold text-brand-text-secondary">الفئة:</span> {formData.category} {formData.subcategory && `> ${formData.subcategory}`}</p>
              <p><span className="font-semibold text-brand-text-secondary">المحافظة:</span> {formData.province}</p>
              <p className="whitespace-pre-wrap"><span className="font-semibold text-brand-text-secondary">الوصف:</span> {formData.description}</p>
               {formData.images && formData.images.length > 0 && (
                <div>
                  <p className="font-semibold text-brand-text-secondary mb-2">الصور:</p>
                  <div className="flex gap-2 flex-wrap">
                    {formData.images.map((imgSrc, index) => (
                      <img key={index} src={imgSrc} className="w-20 h-20 rounded-md object-cover"/>
                    ))}
                  </div>
                </div>
              )}
               {formData.ai_quality_verification_status === 'pending' && <p className="text-blue-400 text-sm mt-2 font-semibold">✓ تم طلب ختم الجودة الذكي.</p>}
               {formData.is_charitable && <p className="text-blue-400 text-sm mt-2 font-semibold">✓ هذا الإعلان يشارك في حملة دعم الفقراء.</p>}
            </div>
            {!isEditMode && (
                <div className="mt-6 space-y-4">
                    <div className="bg-yellow-900/30 p-4 rounded-lg border-2 border-yellow-600/50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <StarIcon className="w-10 h-10 text-brand-accent flex-shrink-0"/>
                            <div>
                                <h4 className="font-bold text-lg text-white">تمييز إعلانك لانتشار أوسع!</h4>
                                <p className="text-sm text-yellow-300/80">سيظهر إعلانك في الصفحة الرئيسية وفي أعلى نتائج البحث مقابل <span className="font-bold">{settings.featured_ad_price?.toLocaleString()} د.ع</span>.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={wantsToFeature} onChange={(e) => setWantsToFeature(e.target.checked)} className="sr-only peer" />
                            <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-brand-accent/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-accent"></div>
                        </label>
                    </div>
                    <p className="text-sm text-yellow-400/80 text-center">
                        {wantsToFeature ? "بعد إرسال الإعلان، ستظهر لك نافذة الدفع." : "يمكنك تمييز الإعلان لاحقاً من صفحة إعلاناتي."}
                    </p>
                </div>
            )}
            <p className="text-sm text-yellow-400/80 text-center pt-4">سيتم إرسال إعلانك للمراجعة من قبل الإدارة قبل نشره.</p>
          </div>
        );
      default:
        return null;
    }
  }

  if (adJustCreated) {
    return (
        <div className="bg-brand-primary min-h-screen text-brand-text">
            <Header variant="page" title="تم استلام إعلانك بنجاح!" />
            <main className="container mx-auto p-4 pb-24 text-center">
                <div className="max-w-2xl mx-auto">
                    <ShieldCheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">شكراً لك!</h2>
                    <p className="text-brand-text-secondary mb-6">لقد تم استلام إعلانك "{adJustCreated.title}" وسيتم مراجعته من قبل فريقنا قريباً.</p>

                    <FeatureAdForm
                        ad={adJustCreated}
                        addToast={addToast}
                        onSuccess={() => {
                            addToast('تم تمييز إعلانك بنجاح وسينشر قريباً!');
                            onNavigate(`/profile/${currentUser?.id}?tab=myAds`);
                        }}
                    />

                    <Button
                        variant="secondary"
                        onClick={() => onNavigate(`/profile/${currentUser?.id}?tab=myAds`)}
                        className="mt-4"
                    >
                        تخطي والمتابعة إلى إعلاناتي
                    </Button>
                </div>
            </main>
        </div>
    )
  }

  return (
    <div className="bg-brand-primary min-h-screen text-brand-text">
       <Header variant="page" title={pageTitle} onBack={handleBack} />
      <main className="container mx-auto p-4 pb-24">
        <div className="bg-brand-secondary max-w-4xl mx-auto p-8 rounded-2xl shadow-lg">
          <Stepper steps={STEPS} currentStep={step} />
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="min-h-[300px]">
              {renderStepContent()}
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-gray-700 mt-8">
              <Button type="button" onClick={prevStep} variant="secondary" disabled={step === 1 || isSubmitting}>السابق</Button>
              {step < STEPS.length ? (
                <Button type="button" onClick={nextStep} disabled={isSubmitting}>التالي</Button>
              ) : (
                <Button type="submit" className={`${isEditMode ? "!bg-blue-600 hover:!bg-blue-700" : "!bg-green-600 hover:!bg-green-700"}`} isLoading={isSubmitting}>
                  {isEditMode ? 'إرسال التعديلات' : 'إرسال للمراجعة'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
