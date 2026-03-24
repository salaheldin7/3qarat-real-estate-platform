import React, { useState, useEffect, useRef } from 'react';
import { Share2, MessageCircle, Send, Copy, Check, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/config/api';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location_city: string;
  location_governorate: string;
  rent_or_buy: string;
  images: string[];
}

interface ChatUser {
  id: number;
  name: string;
  username: string;
  avatar?: string;
  is_online?: boolean;
  isNewUser?: boolean;
  last_message?: { message: string; created_at: string; read: boolean };
  unread_count?: number;
}

interface SharePropertyButtonProps {
  property: Property;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export const SharePropertyButton: React.FC<SharePropertyButtonProps> = ({
  property,
  className = '',
  variant = 'outline',
  size = 'sm',
  showLabel = true,
}) => {
  const { toast } = useToast();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [open, setOpen] = useState(false);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [sendingTo, setSendingTo] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const propertyUrl = `${window.location.origin}/property/${property.id}`;
  
  const formatPrice = (price: number, type: string) => {
    const formatted = new Intl.NumberFormat('en-US').format(price);
    return type === 'rent' 
      ? `${formatted} EGP/month` 
      : `${formatted} EGP`;
  };

  const shareMessage = `🏠 ${property.title}

📍 ${property.location_city}, ${property.location_governorate}
💰 ${formatPrice(property.price, property.rent_or_buy)}
${property.rent_or_buy === 'rent' ? '🔑 For Rent' : '🏷️ For Sale'}

${property.description.substring(0, 150)}${property.description.length > 150 ? '...' : ''}

🔗 View property: ${propertyUrl}`;

  useEffect(() => {
    if (open) {
      loadChatUsers();
    }
  }, [open]);

  // Global user search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchUsersGlobally(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, chatUsers]);

  const loadChatUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setChatUsers([]);
        setLoadingUsers(false);
        return;
      }

      const response = await fetch(`${API_URL}/chats/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChatUsers(data.users || []);
      } else {
        setChatUsers([]);
      }
    } catch (error) {
      console.error('Error loading chat users:', error);
      setChatUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const searchUsersGlobally = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setSearchResults([]);
        setSearchingUsers(false);
        toast({
          title: 'Login Required',
          description: 'Please login to search users',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const users = data.users || data.data || [];
        
        // Mark users as new if they don't have existing chats
        const processedUsers = users.map((u: any) => {
          const existingChat = chatUsers.find(cu => cu.id === u.id);
          
          return {
            ...u,
            isNewUser: !existingChat,
            last_message: existingChat?.last_message || null,
            unread_count: existingChat?.unread_count || 0,
            is_online: u.is_online && u.last_activity_at && 
                      (new Date().getTime() - new Date(u.last_activity_at).getTime()) / (1000 * 60) < 5,
          };
        });
        
        setSearchResults(processedUsers);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Property link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };
  
const shareToChat = async (userId: number, userName: string) => {
  setSendingTo(userId);
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast({
        title: 'Login Required',
        description: 'Please login to share properties',
        variant: 'destructive',
      });
      setSendingTo(null);
      return;
    }

    // Create MINIMAL property data to stay under 1000 character limit
    const propertyData = {
      id: property.id,
      title: property.title.substring(0, 100), // Truncate title if too long
      description: property.description.substring(0, 150), // Keep description short
      price: property.price,
      location_city: property.location_city,
      location_governorate: property.location_governorate,
      rent_or_buy: property.rent_or_buy,
      images: property.images && property.images.length > 0 ? [property.images[0]] : [], // Only first image
      category: property.category || 'property'
    };

    // Create the message content as a compact JSON string
    const messageContent = JSON.stringify({
      type: 'property_card',
      data: propertyData
    });

    // Check message length before sending
    if (messageContent.length > 1000) {
      // If still too long, send even more minimal data
      const minimalData = {
        id: property.id,
        title: property.title.substring(0, 80),
        price: property.price,
        location_city: property.location_city,
        rent_or_buy: property.rent_or_buy,
        images: property.images && property.images.length > 0 ? [property.images[0]] : [],
        category: property.category || 'property'
      };
      
      const minimalMessage = JSON.stringify({
        type: 'property_card',
        data: minimalData
      });
      
      console.log('Using minimal message, length:', minimalMessage.length);
      
      const response = await fetch(`${API_URL}/chats/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: userId,
          message: minimalMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      toast({
        title: 'Success!',
        description: `Property shared with ${userName}`,
      });
      setOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      setSendingTo(null);
      return;
    }

    console.log('Sending message, length:', messageContent.length);

    const response = await fetch(`${API_URL}/chats/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        receiver_id: userId,
        message: messageContent,
      }),
    });

    if (response.ok) {
      toast({
        title: 'Success!',
        description: `Property shared successfully with ${userName}`,
      });
      setOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send message');
    }
  } catch (error: any) {
    console.error('Error sending message:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to send message. Please try again.',
      variant: 'destructive',
    });
  } finally {
    setSendingTo(null);
  }
};

  // Filter chat users locally if searching
  const filteredChatUsers = searchQuery.trim() 
    ? chatUsers.filter((user) => {
        const query = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query)
        );
      })
    : chatUsers;

  // Display search results if searching, otherwise show TOP 3 chat users
  const displayedUsers = searchQuery.trim() 
    ? searchResults
    : filteredChatUsers.slice(0, 3);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setSearchQuery('');
        setSearchResults([]);
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
        >
          <Share2 className={`w-4 h-4 ${showLabel ? 'mr-2' : ''}`} />
          {showLabel && 'Share'}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">Share Property</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Property Preview */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-2.5 sm:p-3 border border-gray-200">
            <div className="flex gap-2 sm:gap-3">
              {property.images && property.images[0] && (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 line-clamp-2 mb-1">
                  {property.title}
                </h4>
                <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                  📍 {property.location_city}, {property.location_governorate}
                </p>
                <p className="text-xs sm:text-sm md:text-base font-bold text-green-600 mt-1">
                  {formatPrice(property.price, property.rent_or_buy)}
                </p>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              Share Via
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full bg-green-50 hover:bg-green-100 border-green-200 h-auto py-2.5 sm:py-3"
                onClick={shareToWhatsApp}
              >
                <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" fill="#25D366" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="text-[10px] sm:text-xs font-medium">WhatsApp</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto py-2.5 sm:py-3"
                onClick={copyLink}
              >
                <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-green-600" />
                      <span className="text-[10px] sm:text-xs font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-600" />
                      <span className="text-[10px] sm:text-xs font-medium">Copy Link</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>

          {/* Share to Chat - Global Search */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              Share to Chat {!searchQuery && chatUsers.length > 3 && (
                <span className="text-[10px] sm:text-xs font-normal text-gray-500">
                  (Top 3 recent chats)
                </span>
              )}
            </h3>
            
            <div className="relative mb-2 sm:mb-3">
              <Input
                placeholder="Search all users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 text-sm h-9 sm:h-10"
              />
              {searchingUsers && (
                <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 animate-spin" />
                </div>
              )}
            </div>

            <div className="max-h-[180px] sm:max-h-48 md:max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-white">
              {loadingUsers ? (
                <div className="p-4 sm:p-6 text-center">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-500 mx-auto mb-1.5 sm:mb-2" />
                  <p className="text-gray-500 text-xs sm:text-sm">Loading chats...</p>
                </div>
              ) : displayedUsers.length === 0 ? (
                <div className="p-4 sm:p-6 text-center">
                  <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-1.5 sm:mb-2" />
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">
                    {searchQuery ? (searchingUsers ? 'Searching...' : 'No users found') : 'No chats yet'}
                  </p>
                  <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                    {searchQuery ? 'Try different keywords' : 'Search to find users'}
                  </p>
                </div>
              ) : (
                displayedUsers.map((user, index) => (
                  <button
                    key={user.id}
                    onClick={() => shareToChat(user.id, user.name)}
                    disabled={sendingTo === user.id}
                    className={`w-full p-2.5 sm:p-3 md:p-4 hover:bg-blue-50 active:bg-blue-100 transition-colors border-b border-gray-100 last:border-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                      index === 0 ? 'bg-gradient-to-r from-blue-50/30 to-transparent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0 ring-2 ring-gray-100">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-semibold text-xs sm:text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="font-semibold text-gray-900 truncate text-xs sm:text-sm md:text-base">
                            {user.name}
                          </p>
                          {user.is_online && (
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse"></div>
                          )}
                          {user.isNewUser && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[9px] sm:text-xs px-1 sm:px-1.5 py-0 h-4 sm:h-5">
                              <UserPlus className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                          @{user.username}
                          {user.isNewUser && <span className="text-gray-400"> • Start chat</span>}
                        </p>
                      </div>
                      {sendingTo === user.id ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 animate-spin text-blue-600 flex-shrink-0" />
                      ) : (
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
            
            {!searchQuery && chatUsers.length > 3 && (
              <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-2">
                💡 Search to see all users
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};