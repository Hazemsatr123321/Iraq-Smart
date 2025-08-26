import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import type { ChatConversation, ChatMessage, Ad, NegotiationSession, DealMemo, NegotiationMessage, TextChatMessage, MessageStatus, ChatMessageDbRow } from '../types';
import { useUser } from './UserContext';
import { useAdmin } from './AdminContext';
import { generateDealMemoFromChat } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';

interface ChatContextType {
  conversations: ChatConversation[];
  getMessagesForConversation: (conversationId: string) => ChatMessage[];
  sendMessage: (conversationId: string, text: string, type?: 'text' | 'ad_link' | 'deal_memo', details?: any) => Promise<void>;
  startConversation: (otherUserId: string, ad?: Ad) => Promise<ChatConversation | null>;
  markConversationAsRead: (conversationId: string) => void;
  generateAndSendDealMemo: (conversationId: string, messages: ChatMessage[]) => Promise<void>;
  approveDealMemo: (conversationId: string, memoId: string) => void;
  unreadCount: number;
  getNegotiationSession: (adId: string) => NegotiationSession | undefined;
  startNegotiation: (adId: string, sellerId: string, targetPrice: number, lowestPrice: number) => Promise<NegotiationSession>;
  sendNegotiationMessage: (sessionId: string, text: string, sender: 'bot' | 'seller') => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useUser();
  const { 
      conversations,
      messages,
      addNewMessage,
      addDealMemo: adminAddDealMemo, 
      updateDealMemo: adminUpdateDealMemo,
      negotiationSessions,
      addNegotiationSession,
      addNegotiationMessage,
      addMessage,
      addConversation,
      updateConversationLastMessage
  } = useAdmin();

  const [userConversations, setUserConversations] = useState<ChatConversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (!currentUser) {
      setUserConversations([]);
      setUnreadCount(0);
      return;
    }

    const myConversations = conversations.filter(c => c.participant_ids.includes(currentUser.id));
    setUserConversations(myConversations);

    const unread = myConversations.reduce((count, conv) => {
        const lastMessage = conv.last_message as ChatMessage;
        if (lastMessage && lastMessage.sender_id !== currentUser.id && lastMessage.status !== 'read') {
            return count + 1;
        }
        return count;
    }, 0);
    setUnreadCount(unread);

    // --- Realtime Subscriptions ---
    const channels: RealtimeChannel[] = [];
    myConversations.forEach(conv => {
        const channel = supabase.channel(`messages:${conv.id}`)
            .on<ChatMessageDbRow>(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conv.id}` },
                (payload) => {
                    console.log('New message received!', payload.new);
                    // Add the new message to the global state in AdminContext
                    addNewMessage(payload.new);
                    // Also update the last_message in the conversation locally for instant UI update
                    updateConversationLastMessage(conv.id, payload.new as ChatMessage);
                }
            )
            .subscribe();
        channels.push(channel);
    });

    return () => {
        console.log("Cleaning up chat subscriptions");
        channels.forEach(channel => supabase.removeChannel(channel));
    };

  }, [currentUser, conversations, messages, addNewMessage, updateConversationLastMessage]);

  const getMessagesForConversation = useCallback((conversationId: string): ChatMessage[] => {
    // Cast the DB row type to the application's union type.
    // This is safe as long as the application logic correctly handles the 'type' property.
    return messages.filter(m => m.conversation_id === conversationId).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) as ChatMessage[];
  }, [messages]);

  const sendMessage = useCallback(async (conversationId: string, text: string, type: 'text' | 'ad_link' | 'deal_memo' = 'text', details?: any) => {
    if (!currentUser) return;
    
    const messageBase = {
        conversation_id: conversationId,
        sender_id: currentUser.id,
        status: 'sent' as MessageStatus,
    };
    
    let messagePayload: Omit<ChatMessageDbRow, 'id' | 'timestamp'>;
    
    if (type === 'text') {
        messagePayload = { ...messageBase, type, text };
    } else if (type === 'ad_link') {
        messagePayload = { ...messageBase, type, ad_details: details };
    } else if (type === 'deal_memo') {
        messagePayload = { ...messageBase, type, memo: details };
    } else {
        return;
    }
    
    const newMessageDbRow = await addMessage(messagePayload);
    // Cast back to the application's union type for use in other parts of the app like 'last_message'.
    const newMessage = newMessageDbRow as ChatMessage;
    await updateConversationLastMessage(conversationId, newMessage);

  }, [currentUser, addMessage, updateConversationLastMessage]);

  const startConversation = useCallback(async (otherUserId: string, ad?: Ad): Promise<ChatConversation | null> => {
    if (!currentUser) return null;
    
    const sortedIds = [currentUser.id, otherUserId].sort();
    
    const existing = conversations.find(c => 
        c.participant_ids.length === 2 && 
        c.participant_ids.every(id => sortedIds.includes(id))
    );

    if (existing) {
        // If a conversation exists, ensure its last message is up-to-date with any new ad context
        if (ad) {
            await sendMessage(existing.id, '', 'ad_link', { ad_id: ad.id, title: ad.title, price: ad.price, image: ad.images[0] });
            await sendMessage(existing.id, `مرحباً، أراسلك بخصوص إعلان "${ad.title}". هل المنتج متوفر؟`);
        }
        return existing;
    }

    const newConversationData: Omit<ChatConversation, 'id'> = {
        participant_ids: sortedIds,
        last_message: null,
    };
    const newConversation = await addConversation(newConversationData);

    const firstMessageText = ad ? `مرحباً، أراسلك بخصوص إعلان "${ad.title}". هل المنتج متوفر؟` : `مرحباً.`;
    if (ad) await sendMessage(newConversation.id, '', 'ad_link', { ad_id: ad.id, title: ad.title, price: ad.price, image: ad.images[0] });
    await sendMessage(newConversation.id, firstMessageText);

    // Return the latest version from state after updates
    return conversations.find(c => c.id === newConversation.id) || newConversation;

  }, [currentUser, sendMessage, conversations, addConversation]);

  const markConversationAsRead = useCallback(async (conversationId: string) => {
    if (!currentUser) return;
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation || !conversation.last_message) return;
    
    const lastMessage = conversation.last_message as ChatMessage;
    if (lastMessage.sender_id === currentUser.id || lastMessage.status === 'read') return;
    
    await updateConversationLastMessage(conversationId, { ...lastMessage, status: 'read' });

  }, [currentUser, conversations, updateConversationLastMessage]);
  
  const generateAndSendDealMemo = useCallback(async (conversationId: string, convMessages: ChatMessage[]) => {
    if (!currentUser) throw new Error("يجب تسجيل الدخول أولاً.");
    const chatHistory = convMessages
        .filter(m => m.type === 'text')
        .map(m => `${m.sender_id === currentUser.id ? 'أنا' : 'الطرف الآخر'}: ${(m as TextChatMessage).text}`)
        .join('\n');

    const dealDetails = await generateDealMemoFromChat(chatHistory);
    const newMemo = await adminAddDealMemo(conversationId, dealDetails, currentUser.id);
    
    await sendMessage(conversationId, '', 'deal_memo', newMemo);
  }, [currentUser, adminAddDealMemo, sendMessage]);

  const approveDealMemo = useCallback((conversationId: string, memoId: string) => {
    if (!currentUser) throw new Error("يجب تسجيل الدخول للموافقة.");
    adminUpdateDealMemo(memoId, {
      approver_ids: [currentUser.id]
    });
  }, [currentUser, adminUpdateDealMemo]);


  const getNegotiationSession = useCallback((adId: string) => {
    return negotiationSessions.find(s => s.ad_id === adId && s.buyer_id === currentUser?.id);
  }, [negotiationSessions, currentUser]);

  const startNegotiation = useCallback(async (adId: string, sellerId: string, targetPrice: number, lowestPrice: number): Promise<NegotiationSession> => {
    if (!currentUser) throw new Error("No user");
     const newSessionData: Omit<NegotiationSession, 'id'> = {
        ad_id: adId,
        buyer_id: currentUser.id,
        seller_id: sellerId,
        status: 'active',
        history: [{
            id: `neg_msg_${Date.now()}`,
            sender: 'bot',
            text: `مرحباً، أود التفاوض على سعر هذا المنتج. هل يمكننا البدء بسعر ${targetPrice.toLocaleString()} دينار عراقي؟`,
            timestamp: new Date().toISOString()
        }],
        target_price: targetPrice,
        lowest_price: lowestPrice
    };
    const newSession = await addNegotiationSession(newSessionData);
    return newSession;
  }, [currentUser, addNegotiationSession]);

  const sendNegotiationMessage = useCallback((sessionId: string, text: string, sender: 'bot' | 'seller') => {
    const newMessage: NegotiationMessage = {
        id: `neg_msg_${Date.now()}`,
        sender: sender,
        text,
        timestamp: new Date().toISOString()
    };
    addNegotiationMessage(sessionId, newMessage);
  }, [addNegotiationMessage]);

  return (
    <ChatContext.Provider value={{ 
        conversations: userConversations,
        getMessagesForConversation, 
        sendMessage, 
        startConversation, 
        unreadCount, 
        markConversationAsRead,
        generateAndSendDealMemo,
        approveDealMemo,
        getNegotiationSession,
        startNegotiation,
        sendNegotiationMessage
     }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};