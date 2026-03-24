import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { API_URL } from '@/config/api';

export const ChatNotification: React.FC = () => {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    loadUnreadChats();
    
    // Listen for chat opened event to reset counter
    const handleChatOpened = () => {
      setTotalUnread(0);
    };
    
    window.addEventListener('chatOpened', handleChatOpened);
    
    // Only poll when page is visible to reduce unnecessary requests
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUnreadChats();
      }
    };

    // Poll for new messages every 30 seconds to minimize server load
    const interval = setInterval(() => {
      if (!document.hidden) {
        loadUnreadChats();
      }
    }, 30000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('chatOpened', handleChatOpened);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadUnreadChats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_URL}/chats/unread`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setTotalUnread(data.total_unread || 0);
      }
    } catch (error) {
      // Silent fail - don't spam console with connection errors
      if (error instanceof Error && error.name !== 'AbortError') {
        console.debug('Chat notification fetch failed:', error.message);
      }
    }
  };

  const handleClick = () => {
    // Reset counter immediately when clicking
    setTotalUnread(0);
    navigate('/chats');
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group"
      title={isRTL ? 'الرسائل' : 'Messages'}
    >
      <MessageCircle className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
      {totalUnread > 0 && (
        <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center shadow-lg animate-pulse border-2 border-white">
          {totalUnread > 99 ? '99+' : totalUnread}
        </Badge>
      )}
    </button>
  );
};

