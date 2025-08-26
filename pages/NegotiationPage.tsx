import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';
import { useAdmin } from '../contexts/AdminContext';
import { Header } from '../components/Header';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { BotIcon } from '../components/icons/BotIcon';
import { Ad, NegotiationMessage, NegotiationSession, ToastType } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { generateNegotiationCounterOffer } from '../services/geminiService';

export const NegotiationPage: React.FC<{
    adId: string;
    onNavigate: (path: string) => void;
    addToast: (message: string, type: 'success' | 'error') => void;
}> = ({ adId, onNavigate, addToast }) => {
    const { getNegotiationSession, startNegotiation, sendNegotiationMessage } = useChat();
    const { getAdById, users } = useAdmin();
    const { currentUser } = useUser();
    
    const [session, setSession] = useState<NegotiationSession | undefined>(() => getNegotiationSession(adId));
    const [ad, setAd] = useState<Ad | undefined>(() => getAdById(adId));
    const [seller, setSeller] = useState(() => ad ? users.find(u => u.id === ad.user_id) : undefined);

    const [isStarted, setIsStarted] = useState(!!session);
    const [isLoading, setIsLoading] = useState(false);
    const [params, setParams] = useState({ targetPrice: '', lowestPrice: '' });
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session?.history]);

    const handleStart = async () => {
        if (!ad || !seller) return;
        const target = parseFloat(params.targetPrice);
        const lowest = parseFloat(params.lowestPrice);
        if (isNaN(target) || isNaN(lowest) || target <= 0 || lowest <= 0 || lowest > target) {
            addToast('الرجاء إدخال أسعار صحيحة (ويجب أن يكون السعر الأدنى أقل من المستهدف).', 'error');
            return;
        }
        setIsLoading(true);
        const newSession = await startNegotiation(adId, seller.id, target, lowest);
        setSession(newSession);
        setIsStarted(true);
        setIsLoading(false);
    };

    const handleSellerResponse = async (responseType: 'accept' | 'reject' | 'counter', amount?: number) => {
        if (!session || !ad) return;
        setIsLoading(true);
        
        let sellerMessageText = '';
        if (responseType === 'accept') sellerMessageText = 'البائع وافق على عرضك!';
        if (responseType === 'reject') sellerMessageText = 'البائع رفض عرضك.';
        if (responseType === 'counter' && amount) sellerMessageText = `البائع قدم عرضاً مضاداً: ${amount.toLocaleString()}`;
        
        const sellerMessage: NegotiationMessage = { id: `neg_msg_${Date.now()}`, sender: 'seller', text: sellerMessageText, timestamp: new Date().toISOString()};
        
        // Use a functional update to ensure we have the latest session state
        setSession(s => s ? {...s, history: [...s.history, sellerMessage]} : undefined);
    
        // Give React time to re-render with the seller's message
        await new Promise(res => setTimeout(res, 100));

        // Now get the latest session state for the AI
        const currentSession = getNegotiationSession(adId);
        if (!currentSession) {
            setIsLoading(false);
            return;
        }

        const lastBotOfferText = [...currentSession.history].reverse().find(m => m.sender === 'bot')?.text.match(/(\d{1,3}(,\d{3})*)/)?.[0];
        const lastBotOfferAmount = lastBotOfferText ? parseFloat(lastBotOfferText.replace(/,/g, '')) : currentSession.target_price;
        
        try {
            const result = await generateNegotiationCounterOffer(currentSession, ad, amount || lastBotOfferAmount);
            await sendNegotiationMessage(currentSession.id, result.responseText, 'bot');
            const updatedSession = getNegotiationSession(adId);
            setSession(updatedSession);
        } catch (error) {
            addToast("حدث خطأ أثناء معالجة رد التفاوض.", "error");
        } finally {
            setIsLoading(false);
        }
    }
    
    if (!ad || !seller) {
        return <div>خطأ: الإعلان غير موجود.</div>
    }

    return (
        <div className="flex flex-col h-screen bg-brand-primary text-brand-text">
            <Header variant="page" title="وكيل التفاوض الآلي" onBack={() => onNavigate(`/ad/${adId}`)} onNavigate={onNavigate} />
            
            {!isStarted ? (
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-brand-secondary p-8 rounded-2xl text-center">
                        <BotIcon className="w-16 h-16 text-brand-accent mx-auto mb-4"/>
                        <h2 className="text-3xl font-bold text-gradient-gold">ابدأ التفاوض بذكاء</h2>
                        <p className="text-brand-text-secondary mt-2 mb-6">حدد شروطك، ودع الوكيل الذكي يتفاوض نيابة عنك مع <span className="font-bold text-white">{seller.name}</span>.</p>
                        <div className="space-y-4 text-left">
                            <Input label="السعر المستهدف الذي تريد البدء به" id="targetPrice" type="number" value={params.targetPrice} onChange={e => setParams(p => ({...p, targetPrice: e.target.value}))} />
                            <Input label="أدنى سعر يمكنك قبوله (سري)" id="lowestPrice" type="number" value={params.lowestPrice} onChange={e => setParams(p => ({...p, lowestPrice: e.target.value}))} />
                        </div>
                        <Button onClick={handleStart} disabled={isLoading} className="w-full mt-8">
                            {isLoading ? 'جاري البدء...' : 'بدء التفاوض الآلي'}
                        </Button>
                    </div>
                </div>
            ) : (
                <main className="flex-grow p-4 overflow-y-auto space-y-2" style={{paddingBottom: '150px'}}>
                    {session?.history.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
                            {msg.sender === 'bot' && <BotIcon className="w-8 h-8 rounded-full self-start flex-shrink-0 text-brand-accent" />}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-md ${msg.sender === 'bot' ? 'bg-brand-secondary text-brand-text rounded-bl-lg' : 'bg-brand-accent text-brand-primary rounded-br-lg'}`}>
                                <p className="text-base">{msg.text}</p>
                            </div>
                            {msg.sender === 'seller' && <img src={seller.profile_picture} className="w-8 h-8 rounded-full self-start flex-shrink-0" />}
                        </div>
                    ))}
                     <div ref={messagesEndRef} />
                     {isLoading && <LoadingSpinner text="الوكيل يفكر..." />}
                </main>
            )}

            {isStarted && !isLoading && (
                 <footer className="bg-brand-primary p-2 border-t border-brand-secondary/50 fixed bottom-0 left-0 right-0 z-10">
                    <div className="container mx-auto text-center">
                        <p className="text-sm text-brand-text-secondary mb-2">محاكاة رد البائع:</p>
                        <div className="flex justify-center gap-2">
                            <Button onClick={() => handleSellerResponse('accept')} variant="secondary" className="!bg-green-600 hover:!bg-green-700">قبول العرض</Button>
                            <Button onClick={() => handleSellerResponse('counter', 440000)} variant="secondary">عرض مضاد (440,000)</Button>
                            <Button onClick={() => handleSellerResponse('reject')} variant="secondary" className="!bg-red-600 hover:!bg-red-700">رفض</Button>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};