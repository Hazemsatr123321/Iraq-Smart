import React, { useState } from 'react';
import { Header } from '../components/Header';
import { useAdmin } from '../contexts/AdminContext';
import { generateMarketAnalysis } from '../services/geminiService';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { TrendingUpIcon } from '../components/icons/TrendingUpIcon';
import { TargetIcon } from '../components/icons/TargetIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { MarketAnalysis } from '../types';
import { DollarSignIcon } from '../components/icons/DollarSignIcon';

const AnalysisResultCard: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({ title, icon, children }) => (
    <div className="bg-brand-primary/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-bold text-brand-accent mb-3 flex items-center gap-2">
            {icon}
            {title}
        </h3>
        <div className="text-brand-text-secondary space-y-2 prose prose-invert prose-p:my-1 prose-ul:my-1">
             <div dangerouslySetInnerHTML={{ __html: String(children).replace(/\n/g, '<br />').replace(/\* (.*?)(<br \/>|$)/g, '<ul class="list-disc list-inside"><li>$1</li></ul>').replace(/<\/ul><br \/><ul>/g, '') }} />
        </div>
    </div>
);


export const MarketAnalystPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { getDemandHotspots, getProductOpportunities, ads, rfqs } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MarketAnalysis | null>(null);

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
        const marketData = {
            topRfqs: rfqs.filter(r => r.status === 'open').slice(0, 5),
            recentAds: ads.filter(a => a.status === 'approved').slice(-5),
            hotspots: getDemandHotspots()
        }
        const result = await generateMarketAnalysis(marketData);
        setAnalysisResult(result);
    } catch (error) {
        console.error("Failed to generate market analysis:", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary text-brand-text">
      <Header variant="page" title="محلل السوق الآلي" onBack={() => onNavigate('/account')} onNavigate={onNavigate} />

      <main className="container mx-auto p-4 pb-24">
        <div className="text-center mb-12">
            <TrendingUpIcon className="w-16 h-16 text-brand-accent mx-auto mb-4"/>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-gold">
                غرفة عملياتك الاستخباراتية
            </h1>
            <p className="mt-4 text-lg text-brand-text-secondary max-w-2xl mx-auto">
                اطلب تحليلاً للسوق في أي وقت للحصول على رؤى فورية تساعدك على التفوق.
            </p>
        </div>

        <div className="max-w-4xl mx-auto">
            {!analysisResult && !isLoading && (
                 <div className="text-center bg-gradient-to-br from-brand-secondary to-brand-primary/60 p-10 rounded-2xl border-2 border-brand-accent/30 shadow-2xl modal-glow-animation">
                    <h2 className="text-2xl font-bold text-white mb-3">تحليل شامل بضغطة زر</h2>
                    <p className="text-xl text-brand-text-secondary mb-8">دع الذكاء الاصطناعي يحلل بيانات السوق الحية ويقدم لك رؤى استراتيجية قابلة للتنفيذ.</p>
                    <Button onClick={handleGenerateAnalysis} className="flex items-center gap-2 mx-auto !py-3 !px-8 !text-lg animate-pulse">
                        <SparklesIcon />
                        اطلب تحليل استراتيجي الآن
                    </Button>
                </div>
            )}
            
            {isLoading && <LoadingSpinner text="المحلل الآلي يعالج بيانات السوق الحالية..." />}

            {analysisResult && (
                <div className="space-y-6 animate-fadeInUp">
                    <AnalysisResultCard title="مؤشر الأسعار" icon={<DollarSignIcon className="w-6 h-6" />}>
                        {analysisResult.price_index}
                    </AnalysisResultCard>
                    <AnalysisResultCard title="الفرص الناشئة" icon={<TargetIcon className="w-6 h-6" />}>
                        {analysisResult.emerging_opportunities}
                    </AnalysisResultCard>
                    <AnalysisResultCard title="تحليل المنافسين" icon={<UsersIcon className="w-6 h-6" />}>
                        {analysisResult.competitor_analysis}
                    </AnalysisResultCard>
                     <Button onClick={handleGenerateAnalysis} variant='secondary' className="w-full mt-4">إعادة التحليل</Button>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};