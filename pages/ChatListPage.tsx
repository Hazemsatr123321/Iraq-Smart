import React from 'react';
import { Header } from '../components/Header';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { ChatMessage } from '../types';
import { useAdmin } from '../contexts/AdminContext';

export const ChatListPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { conversations } = useChat();
  const { currentUser } = useUser();
  const { users } = useAdmin();

  const getOtherParticipant = (participantIds: string[]) => {
    const otherId = participantIds.find(id => id !== currentUser?.id);
    return users.find(u => u.id === otherId);
  };
  
  const sortedConversations = [...conversations].sort((a, b) => 
    new Date((b.last_message as unknown as ChatMessage).timestamp).getTime() - new Date((a.last_message as unknown as ChatMessage).timestamp).getTime()
  );

  const getLastMessageText = (message: ChatMessage): string => {
    if (message.type === 'text') {
      return message.text;
    }
    if (message.type === 'ad_link') {
      return `بخصوص إعلان: "${message.ad_details.title}"`;
    }
    return '...';
  }

  return (
    <div className="bg-brand-primary min-h-screen text-brand-text">
      <Header variant="page" title="محادثاتي" onBack={() => onNavigate('/')} onNavigate={onNavigate} />
      <main className="container mx-auto p-4 pb-24">
        <div className="bg-brand-secondary rounded-2xl overflow-hidden">
          {sortedConversations.length > 0 ? (
            <ul className="divide-y divide-brand-primary/50">
              {sortedConversations.map(conv => {
                const otherUser = getOtherParticipant(conv.participant_ids);
                if (!otherUser) return null;
                
                const lastMessage = conv.last_message as unknown as ChatMessage;
                const isUnread = lastMessage.sender_id !== currentUser?.id && lastMessage.status !== 'read';

                return (
                  <li key={conv.id} onClick={() => onNavigate(`/chat/${conv.id}`)} className="p-4 flex items-center gap-4 cursor-pointer hover:bg-brand-primary/50 transition-colors">
                    <img src={otherUser.profile_picture} alt={otherUser.name} className="w-14 h-14 rounded-full" />
                    <div className="flex-grow overflow-hidden">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <p className="font-bold text-lg text-brand-text">{otherUser.name}</p>
                           {otherUser.is_verified && <VerifiedBadge className="w-4 h-4"/>}
                        </div>
                        <p className="text-xs text-brand-text-secondary">{new Date(lastMessage.timestamp).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className={`text-sm ${isUnread ? 'text-white font-bold' : 'text-brand-text-secondary'} truncate w-11/12`}>
                          {lastMessage.sender_id === currentUser?.id && 'أنت: '}
                          {getLastMessageText(lastMessage)}
                        </p>
                        {isUnread && <span className="w-3 h-3 bg-brand-accent rounded-full flex-shrink-0"></span>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-16">
              <p className="text-brand-text-secondary text-xl">لا توجد لديك محادثات حالياً.</p>
              <p className="mt-2">ابدأ محادثة مع أحد التجار من صفحة الإعلان.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};