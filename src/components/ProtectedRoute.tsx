import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUser } from '@/utils/auth';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/config/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSeller?: boolean;
  isRTL?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireSeller = false,
  isRTL = false 
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    const checkBanStatus = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setIsChecking(false);
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

        if (response.status === 403 || data.banned === true || data.error === 'ACCOUNT_BANNED') {
          setIsBanned(true);
          
          // Clear auth
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');

          toast({
            title: isRTL ? "تم حظر حسابك" : "Account Banned",
            description: data.ban_reason || (isRTL 
              ? "تم حظر حسابك من قبل المسؤول."
              : "Your account has been banned."),
            variant: "destructive",
            duration: 8000,
          });
        }
      } catch (error) {
        console.error('Ban check error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkBanStatus();
  }, [location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isBanned || !isAuthenticated()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const user = getUser();

  if (requireAdmin && !user?.is_admin && !user?.is_founder) {
    toast({
      title: isRTL ? "غير مصرح" : "Unauthorized",
      description: isRTL ? "يجب أن تكون مسؤولاً للوصول إلى هذه الصفحة" : "You must be an admin to access this page",
      variant: "destructive",
    });
    return <Navigate to="/" replace />;
  }

 if (requireSeller && !user?.is_seller && !user?.is_admin && !user?.is_founder) {
  toast({
    title: isRTL ? "غير مصرح" : "Unauthorized",
    description: isRTL
      ? "يجب أن تكون بائعًا أو مسؤولًا أو مؤسسًا للوصول إلى هذه الصفحة"
      : "You must be a seller, admin, or founder to access this page",
    variant: "destructive",
  });
  return <Navigate to="/" replace />;
}


  return <>{children}</>;
};

export default ProtectedRoute;