import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/common/Button';
import { SendIcon } from '../components/icons/SendIcon';
import { Header } from '../components/Header';
import { ChatMessage, MessageStatus, ToastType, PartnershipScore, TextChatMessage } from '../types';
import { AdLinkMessageCard } from '../components/AdLinkMessageCard';
import { CheckIcon } from '../components/icons/CheckIcon';
import { CheckDoneIcon } from '../components/icons/CheckDoneIcon';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { FileSignatureIcon } from '../components/icons/FileSignatureIcon';
import { DealMemo } from '../components/chat/DealMemo';
import { useAdmin } from '../contexts/AdminContext';
import { PartnershipScoreBadge } from '../components/PartnershipScoreBadge';
import { generatePartnershipAnalysis } from '../services/geminiService';


const MessageStatusIndicator: React.FC<{ status: MessageStatus }> = ({ status }) => {
    switch (status) {
        case 'sent': return <CheckIcon className="w-4 h-4 text-gray-800/80" />;
        case 'delivered': return <CheckDoneIcon className="w-4 h-4 text-gray-800/80" />;
        case 'read': return <CheckDoneIcon className="w-4 h-4 text-blue-400" />;
        default: return null;
    }
};

const formatLastSeen = (lastSeen?: string): { text: string, color: string } => {
    if (!lastSeen) return { text: 'غير معروف', color: 'text-gray-500' };
    const now = new Date();
    const seenDate = new Date(lastSeen);
    const diffSeconds = (now.getTime() - seenDate.getTime()) / 1000;
    
    if (diffSeconds < 60) return { text: 'متصل الآن', color: 'text-green-400' };
    if (diffSeconds < 3600) return { text: `آخر ظهور قبل ${Math.floor(diffSeconds / 60)} دقيقة`, color: 'text-gray-400' };
    if (diffSeconds < 86400) return { text: `آخر ظهور قبل ${Math.floor(diffSeconds / 3600)} ساعة`, color: 'text-gray-500' };
    return { text: `آخر ظهور ${seenDate.toLocaleDateString('ar-IQ')}`, color: 'text-gray-500' };
}

export const ChatDetailPage: React.FC<{ 
    conversationId: string; 
    onNavigate: (path: string) => void;
    addToast: (message: string, type?: ToastType) => void;
}> = ({ conversationId, onNavigate, addToast }) => {
  const { sendMessage, conversations, markConversationAsRead, generateAndSendDealMemo, approveDealMemo, getMessagesForConversation } = useChat();
  const { currentUser } = useUser();
  const { calculatePartnershipScore, users } = useAdmin();
  const messages = getMessagesForConversation(conversationId);
  const [newMessage, setNewMessage] = useState('');
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);
  const [partnershipScore, setPartnershipScore] = useState<PartnershipScore | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find(c => c.id === conversationId);
  const otherParticipantId = conversation?.participant_ids.find(id => id !== currentUser?.id);
  const otherUser = users.find(u => u.id === otherParticipantId);
  
  useEffect(() => {
    markConversationAsRead(conversationId);
  }, [conversationId, markConversationAsRead, messages.length]);

  useEffect(() => {
    let isMounted = true;
    if (currentUser && otherUser) {
        const scoreData = calculatePartnershipScore(currentUser.id, otherUser.id);
        const dealCount = scoreData.dealCount;
        
        if (dealCount > 0) {
            const calculatedScore = Math.round(Math.min(100, 10 + dealCount * 20 + scoreData.avgRating * 5));
            generatePartnershipAnalysis(calculatedScore, dealCount).then(analysis => {
                if (isMounted) {
                    setPartnershipScore({ score: calculatedScore, analysis });
                }
            });
        } else {
             setPartnershipScore({ score: 15, analysis: "هذه بداية علاقة تجارية جديدة. أكمل الصفقات لزيادة مؤشر الشراكة." });
        }
    } else {
        setPartnershipScore(null);
    }
    return () => { isMounted = false; };
  }, [currentUser, otherUser, calculatePartnershipScore]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(conversationId, newMessage);
      setNewMessage('');
    }
  };

  const handleGenerateDealMemo = async () => {
    if (isGeneratingMemo) return;
    setIsGeneratingMemo(true);
    addToast("الذكاء الاصطناعي يحلل المحادثة لإنشاء مذكرة اتفاق...", "success");
    try {
        await generateAndSendDealMemo(conversationId, messages);
    } catch (error: any) {
        addToast(error.message || "فشل في إنشاء مذكرة الاتفاق.", "error");
    } finally {
        setIsGeneratingMemo(false);
    }
  };
  
  const handleApproveDealMemo = (memoId: string) => {
    try {
        approveDealMemo(conversationId, memoId);
        addToast("تمت الموافقة على الاتفاق.", "success");
    } catch (error: any) {
        addToast(error.message || "فشل في الموافقة على الاتفاق.", "error");
    }
  };

   const handleInitiateSafePay = (memoId: string) => {
    onNavigate(`/safepay/${memoId}`);
  };

  if (!conversation || !otherUser) {
    return (
      <div className="bg-brand-primary min-h-screen flex flex-col items-center justify-center text-brand-text">
        <Header variant="page" title="خطأ" onBack={() => onNavigate('/chat')} onNavigate={onNavigate}/>
        <p className="mt-8">جاري تحميل المحادثة...</p>
      </div>
    );
  }
  
  const lastSeenStatus = formatLastSeen(otherUser.last_seen);
  
  const ChatHeader = () => (
     <div className="bg-brand-secondary/80 backdrop-blur-md sticky top-0 z-20 p-3 shadow-lg shadow-black/20">
        <div className="container mx-auto flex items-center justify-between gap-3">
            <button onClick={() => onNavigate('/chat')} className="text-brand-text p-2 rounded-full hover:bg-brand-primary/50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <div className="flex items-center gap-3 flex-grow">
                <img src={otherUser.profile_picture} alt={otherUser.name} className="w-10 h-10 rounded-full"/>
                <div>
                     <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold text-brand-text">{otherUser.name}</h1>
                        {otherUser.is_verified && <VerifiedBadge className="w-4 h-4" />}
                        {partnershipScore && <PartnershipScoreBadge scoreData={partnershipScore} />}
                    </div>
                    <p className={`text-xs ${lastSeenStatus.color}`}>{lastSeenStatus.text}</p>
                </div>
            </div>
            <div className="w-10">
                <Button isLoading={isGeneratingMemo} onClick={handleGenerateDealMemo} variant="secondary" className="!p-2" title="توثيق الصفقة">
                    <FileSignatureIcon className="w-6 h-6"/>
                </Button>
            </div>
        </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen chat-bg">
      <ChatHeader />
      <main className="flex-grow p-4 overflow-y-auto" style={{paddingBottom: '80px'}}>
        <div className="space-y-2">
          {messages.map((msg) => {
            const isSentByMe = msg.sender_id === currentUser?.id;
            
            if (msg.type === 'ad_link') return <AdLinkMessageCard key={msg.id} adDetails={msg.ad_details} onNavigate={onNavigate} />;
            if (msg.type === 'deal_memo') return <DealMemo key={msg.id} memo={msg.memo} onApprove={handleApproveDealMemo} onInitiateSafePay={handleInitiateSafePay} />;
            
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                {!isSentByMe && <img src={otherUser.profile_picture} alt={otherUser.name} className="w-8 h-8 rounded-full self-start" />}
                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-md ${isSentByMe ? 'bg-brand-accent text-brand-primary rounded-br-lg' : 'bg-brand-secondary text-brand-text rounded-bl-lg'}`}>
                  <p className="text-base" style={{overflowWrap: 'break-word'}}>{(msg as TextChatMessage).text}</p>
                  <div className={`text-xs mt-1 flex items-center gap-1 ${isSentByMe ? 'text-gray-800/80 justify-end' : 'text-brand-text-secondary justify-start'}`}>
                    <span>{new Date(msg.timestamp).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}</span>
                    {isSentByMe && <MessageStatusIndicator status={msg.status} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </main>
      <footer className="bg-brand-primary p-2 border-t border-brand-secondary/50 fixed bottom-0 left-0 right-0 z-10">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 container mx-auto">
          <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="اكتب رسالتك هنا..." className="w-full bg-brand-secondary text-brand-text placeholder-brand-text-secondary border border-gray-600 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent" />
          <Button type="submit" className="!p-3.5 !rounded-full">
            <SendIcon className="w-5 h-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
};