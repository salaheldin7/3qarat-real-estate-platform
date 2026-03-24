import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '@/utils/auth';
import { Loader2 } from 'lucide-react';

interface GuestOnlyGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const GuestOnlyGuard: React.FC<GuestOnlyGuardProps> = ({ 
  children, 
  redirectTo = '/' 
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo]);

  if (isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return <>{children}</>;
};