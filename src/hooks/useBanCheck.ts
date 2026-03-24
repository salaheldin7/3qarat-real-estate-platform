import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/config/api';

export const useBanCheck = (isRTL: boolean = false) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownBanToast = useRef(false);

  const checkBanStatus = async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      // No token, user not logged in
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      return;
    }

    try {
      const response = await fetch(`${API_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      // Check if user is banned (403 status or banned flag)
      if (response.status === 403 || data.banned === true || data.error === 'ACCOUNT_BANNED') {
        // Clear auth data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        // Show ban notification only once
        if (!hasShownBanToast.current) {
          hasShownBanToast.current = true;
          
          toast({
            title: isRTL ? "تم حظر حسابك" : "Account Banned",
            description: data.ban_reason || (isRTL 
              ? "تم حظر حسابك من قبل المسؤول. إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بالدعم."
              : "Your account has been banned by an administrator. If you believe this is a mistake, please contact support."),
            variant: "destructive",
            duration: 10000, // Show for 10 seconds
          });
        }

        // Stop checking
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }

        // Redirect to home after a short delay
        setTimeout(() => {
          navigate('/', { replace: true });
          window.location.reload(); // Force full reload to clear any cached state
        }, 1000);
      }
    } catch (error) {
      console.error('Ban check error:', error);
      // Don't do anything on network errors - might be temporary
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      // Check immediately on mount
      checkBanStatus();
      
      // Then check every 10 seconds
      checkIntervalRef.current = setInterval(checkBanStatus, 10000);
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  return { checkBanStatus };
};