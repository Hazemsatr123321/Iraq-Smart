import React, { useState } from 'react';
import { Header } from '../components/Header';
import { useAdmin } from '../contexts/AdminContext';
import { useUser } from '../contexts/UserContext';
import { generatePricingAdvice, generateDemandAdvice, generateOpportunityAdvice } from '../services/geminiService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SparklesIcon } from '../components/icons/SparklesIcon';

type AnalysisType = 'pricing' | 'demand' | 'opportunity';
type AnalysisResult = { type: AnalysisType; content: string };

const AnalysisCard: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
  isLoading: boolean;
  result: string;
  onAnalyze: () => void;
}> = ({ title, description, children, isLoading, result, onAnalyze }) => {
  return (
    <div className="bg-brand-secondary p-6 rounded-2xl border border-gray-700/50 shadow-lg">
      <h3 className="text-2xl font-bold text-brand-accent mb-2">{title}</h3>
      <p className="text-brand-text-secondary mb-6">{description}</p>
      
      {!result && !isLoading && (
        <div className="space-y-4">
          {children}
          <Button onClick={onAnalyze} className="w-full mt-2" disabled={isLoading}>
            {isLoading ? 'جاري التحليل...' : 'احصل على تحليل ذكي'}
          </Button>
        </div>
      )}
      
      {isLoading && <LoadingSpinner text="المستشار الذكي يحلل البيانات..." />}
      
      {result && (
        <div className="bg-brand-primary/50 p-4 rounded-lg border-l-4 border-brand-accent">
          <p className="text-white whitespace-pre-line leading-relaxed">{result}</p>
        </div>
      )}
    </div>
  );
};


export const MarketAdvisorPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useUser();
  const { getPricingAnalysis, getDemandHotspots, getProductOpportunities } = useAdmin();
  const [productName, setProductName] = useState('');
  const [loadingStates, setLoadingStates] = useState({ pricing: false, demand: false, opportunity: false });
  const [analysisResults, setAnalysisResults] = useState({ pricing: '', demand: '', opportunity: '' });

  const handleAnalysis = async (type: AnalysisType) => {
    setLoadingStates(prev => ({ ...prev, [type]: true }));
    setAnalysisResults(prev => ({ ...prev, [type]: '' }));
    let result = '';

    try {
      if (type === 'pricing') {
        if (!currentUser) {
            result = "يجب تسجيل الدخول لاستخدام هذه الميزة.";
        } else if (!productName) {
            result = 'الرجاء إدخال اسم المنتج لتحليل سعره.';
        } else {
            const { myPrice, competitorPrices } = getPricingAnalysis(productName, currentUser.id);
            if (myPrice === null) {
                result = `لم يتم العثور على إعلانات لك بهذا الاسم. تأكد من أن اسم المنتج يطابق إعلاناتك.`;
            } else if (competitorPrices.length === 0) {
                result = `لا توجد إعلانات منافسة كافية لتحليل هذا المنتج حالياً. أنت تهيمن على السوق!`;
            } else {
                result = await generatePricingAdvice(productName, myPrice, competitorPrices);
            }
        }
      } else if (type === 'demand') {
        const hotspots = getDemandHotspots();
        if(hotspots.length === 0) {
            result = 'لا توجد بيانات طلب كافية في الوقت الحالي لتقديم تحليل دقيق.';
        } else {
            result = await generateDemandAdvice(hotspots);
        }
      } else if (type === 'opportunity') {
        const opportunities = getProductOpportunities();
         if(opportunities.length === 0) {
            result = 'يبدو أن السوق متوازن حالياً. لا توجد فجوات واضحة بين العرض والطلب.';
        } else {
            result = await generateOpportunityAdvice(opportunities);
        }
      }
    } catch (error) {
        console.error(`Error during ${type} analysis:`, error);
        result = 'حدث خطأ أثناء التواصل مع المستشار الذكي. حاول مرة أخرى.';
    }
    
    setAnalysisResults(prev => ({ ...prev, [type]: result }));
    setLoadingStates(prev => ({ ...prev, [type]: false }));
  };

  return (
    <div className="min-h-screen bg-brand-primary text-brand-text">
      <Header variant="page" title="مستشار السوق الذكي" onBack={() => onNavigate('/account')} onNavigate={onNavigate} />

      <main className="container mx-auto p-4 pb-24">
        <div className="text-center mb-12">
            <SparklesIcon className="w-16 h-16 text-brand-accent mx-auto mb-4"/>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-gold">
                شريكك الاستراتيجي للنجاح
            </h1>
            <p className="mt-4 text-lg text-brand-text-secondary max-w-2xl mx-auto">
                أدوات حصرية مدعومة بالذكاء الاصطناعي لتحليل السوق واتخاذ قرارات أكثر ربحية.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Pricing Analysis */}
            <AnalysisCard
              title="تحليل التسعير"
              description="قارن أسعارك مع المنافسين واحصل على نصيحة فورية لتكون الأكثر تنافسية."
              isLoading={loadingStates.pricing}
              result={analysisResults.pricing}
              onAnalyze={() => handleAnalysis('pricing')}
            >
              <Input
                label="اسم المنتج الذي تبيعه"
                placeholder="مثال: تمر زاهدي"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </AnalysisCard>

            {/* Demand Analysis */}
             <AnalysisCard
              title="مناطق الطلب الساخنة"
              description="اكتشف المحافظات التي يزداد فيها الطلب على المنتجات لتوجيه جهودك."
              isLoading={loadingStates.demand}
              result={analysisResults.demand}
              onAnalyze={() => handleAnalysis('demand')}
            >
              <p className="text-brand-text-secondary text-center">يقوم هذا التحليل بمسح جميع الطلبيات المفتوحة في التطبيق لتحديد المناطق الجغرافية الأكثر طلباً.</p>
            </AnalysisCard>


            {/* Opportunity Analysis */}
            <AnalysisCard
              title="فرص المنتجات غير المستغلة"
              description="ابحث عن الفجوات في السوق: منتجات عليها طلب عالٍ ومنافسة قليلة."
              isLoading={loadingStates.opportunity}
              result={analysisResults.opportunity}
              onAnalyze={() => handleAnalysis('opportunity')}
            >
                <p className="text-brand-text-secondary text-center">يقوم هذا التحليل بمقارنة فئات الطلب مع فئات الإعلانات المعروضة لاكتشاف الفرص المربحة.</p>
            </AnalysisCard>
        </div>
      </main>
    </div>
  );
};