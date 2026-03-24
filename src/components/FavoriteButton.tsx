import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getAuthToken, isAuthenticated } from '@/utils/auth';
import { API_URL } from '@/config/api';

interface FavoriteButtonProps {
  propertyId: string;
  initialIsFavorited?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
  showText?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  propertyId,
  initialIsFavorited = false,
  className = '',
  size = 'icon',
  variant = 'ghost',
  showText = false,
}) => {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is authenticated
    if (!isAuthenticated()) {
      toast({
        title: 'Login Required',
        description: 'Please login to add properties to favorites',
        variant: 'destructive',
      });
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setIsLoading(true);

    try {
      const token = getAuthToken();
      const url = isFavorited
        ? `${API_URL}/favorites/${propertyId}`
        : `${API_URL}/favorites/${propertyId}`;

      const response = await fetch(url, {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setIsFavorited(!isFavorited);
        toast({
          title: isFavorited ? 'Removed from favorites' : 'Added to favorites',
          description: data.message,
        });
      } else {
        throw new Error(data.message || 'Failed to update favorites');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update favorites',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={toggleFavorite}
      size={size}
      variant={variant}
      className={`${className} ${isFavorited ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
      disabled={isLoading}
    >
      <Heart
        className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`}
      />
      {showText && (
        <span className="ml-2">
          {isFavorited ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}
    </Button>
  );
};

