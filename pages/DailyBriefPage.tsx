import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useUser } from '../contexts/UserContext';
import { Header } from '../components/Header';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { generateMarketBriefing } from '../services/geminiService';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';

export const DailyBriefPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const { marketBriefs, addMarketBrief, rfqs, ads, getDemandHotspots } = useAdmin();
    const [isLoading, setIsLoading] = useState(false);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysBrief = useMemo(() => marketBriefs.find(b => b.date === todayStr), [marketBriefs, todayStr]);

    const handleGenerateBrief = async () => {
        setIsLoading(true);
        try {
            const topRfqs = rfqs.filter(r=>r.status === 'open').slice(0, 5);
            const recentAds = ads.filter(a=>a.status==='approved').slice(0, 5);
            const hotspots = getDemandHotspots();

            const content = await generateMarketBriefing(topRfqs, recentAds, hotspots);
            addMarketBrief({ date: todayStr, content });
        } catch (error) {
            console.error("Failed to generate brief:", error);
            // Optionally add a toast message here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-primary text-brand-text">
            <Header variant="page" title="الموجز اليومي للسوق" onBack={() => onNavigate('/account')} onNavigate={onNavigate} />

            <main className="container mx-auto p-4 pb-24">
                <div className="text-center mb-12">
                    <BookOpenIcon className="w-16 h-16 text-brand-accent mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-gold">
                        نبض السوق في متناول يدك
                    </h1>
                    <p className="mt-4 text-lg text-brand-text-secondary max-w-2xl mx-auto">
                        تقريرك اليومي الذكي. يتم إنشاؤه مرة واحدة يومياً لضمان حصولك على أحدث التحليلات.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-brand-secondary p-8 rounded-2xl shadow-lg border border-gray-700/50">
                    {isLoading ? (
                        <LoadingSpinner text="الذكاء الاصطناعي يجمع ويحلل بيانات اليوم..." />
                    ) : todaysBrief ? (
                        <div className="prose prose-invert prose-lg max-w-none prose-p:text-brand-text-secondary prose-headings:text-brand-accent prose-strong:text-white">
                            <div dangerouslySetInnerHTML={{ __html: todaysBrief.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\* (.*?)(<br \/>|$)/g, '<ul><li>$1</li></ul>').replace(/<\/ul><br \/><ul>/g, '') }} />
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-xl mb-6">لم يتم إنشاء موجز اليوم بعد.</p>
                            <Button onClick={handleGenerateBrief} className="flex items-center gap-2 mx-auto">
                                <SparklesIcon />
                                إنشاء موجز اليوم
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};