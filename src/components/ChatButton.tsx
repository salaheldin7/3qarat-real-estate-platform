import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatButtonProps {
  userId: number;
  userName?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
  showName?: boolean; // New prop to control if name is shown
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  userId,
  userName,
  className = '',
  size = 'default',
  variant = 'default',
  disabled = false,
  showName = false, // Default to false for compact display
}) => {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();

  const handleChatClick = () => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token'); // Changed from 'token' to 'auth_token'
    const userStr = localStorage.getItem('user');
    
    console.log('ChatButton - Token exists:', !!token);
    console.log('ChatButton - User data:', userStr);
    
    if (!token || !userStr) {
      console.log('ChatButton - Redirecting to login (no token or user)');
      // Redirect to login
      navigate('/login', { state: { from: window.location.pathname, chatWith: userId } });
      return;
    }

    // Check if user is trying to chat with themselves
    try {
      const currentUser = JSON.parse(userStr);
      console.log('ChatButton - Current user ID:', currentUser.id, 'Target user ID:', userId);
      
      if (currentUser.id === userId) {
        console.log('ChatButton - Cannot chat with yourself');
        return; // Don't allow chatting with yourself
      }

      // Navigate to chat panel with this user
      console.log('ChatButton - Navigating to chat:', `/chats/${userId}`);
      navigate(`/chats/${userId}`);
    } catch (error) {
      console.error('ChatButton - Error parsing user data:', error);
      navigate('/login', { state: { from: window.location.pathname, chatWith: userId } });
    }
  };

  const getButtonText = () => {
    if (showName && userName) {
      return isRTL ? `محادثة مع ${userName}` : `Chat with ${userName}`;
    }
    return isRTL ? 'محادثة' : 'Chat';
  };

  return (
    <Button
      onClick={handleChatClick}
      size={size}
      variant={variant}
      className={`${className}`}
      disabled={disabled}
    >
      <MessageCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
      {getButtonText()}
    </Button>
  );
};
