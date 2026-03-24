import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, MessageCircle, ArrowLeft, Loader2, Search, X, Shield, Crown, CheckCheck, Check, Trash2, MoreVertical, UserPlus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PropertyMessageCard } from '@/components/PropertyMessageCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getAuthToken, getUser, isAuthenticated } from '@/utils/auth';
import { API_URL } from '@/config/api';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  read_at?: string | null;
  is_read?: boolean;
  sender?: {
    id: number;
    name: string;
    username: string;
  };
  receiver?: {
    id: number;
    name: string;
    username: string;
  };
}

interface ChatUser {
  id: number;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  is_admin: boolean;
  is_founder: boolean;
  avatar?: string;
  is_online?: boolean;
  last_seen_at?: string | null;
  last_activity_at?: string | null;
  last_message?: { message: string; created_at: string; read: boolean };
  unread_count?: number;
  isNewUser?: boolean;
}

export const ChatPanel: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagePollingRef = useRef<NodeJS.Timeout | null>(null);
  const userListPollingRef = useRef<NodeJS.Timeout | null>(null);
  const activityPollingRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingConversation, setDeletingConversation] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const parsePropertyMessage = (message: string) => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.type === 'property_card' && parsed.data) {
        return parsed.data;
      }
    } catch (e) {
      // Not a JSON message or not a property card
    }
    return null;
  };
  
  const getMessagePreview = (message: string): string => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.type === 'property_card' && parsed.data) {
        return '🏠 Shared a property';
      }
    } catch (e) {
      // Not a JSON message, return as is
    }
    return message;
  };

  // Helper function to navigate to user profile
  const navigateToProfile = (user: ChatUser) => {
    if (user.username) {
      navigate(`/profile/${user.username}`);
    } else {
      navigate(`/profile/${user.id}`);
    }
  };

  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 200;
  };

  const handleScroll = () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    
    isUserScrollingRef.current = true;
    
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 2000);
  };

  const scrollToBottom = (force: boolean = false) => {
    if (force || (!isUserScrollingRef.current && isNearBottom())) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const updateActivity = async () => {
    try {
      const token = getAuthToken();
      await fetch(`${API_URL}/chats/activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
    } catch (error) {
      // Silent fail
    }
  };

  const setOffline = async () => {
    try {
      const token = getAuthToken();
      await fetch(`${API_URL}/chats/offline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
    } catch (error) {
      // Silent fail
    }
  };

  const searchUsersGlobally = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const users = data.users || data.data || [];
        
        const filteredUsers = users
          .filter((u: any) => u.id !== currentUser?.id)
          .map((u: any) => {
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
        
        setSearchResults(filteredUsers);
      } else {
        console.error('Search failed:', response.status, response.statusText);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
      toast({
        title: 'Search Error',
        description: 'Failed to search users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleTyping = () => {
    // Just notify the server, don't show local indicator
  };

  const getOnlineStatus = (user: any) => {
    if (!user?.last_activity_at) return false;
    const diffMinutes = (Date.now() - new Date(user.last_activity_at).getTime()) / 60000;
    return diffMinutes < 5; // online if active within last 5 minutes
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    const user = getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setCurrentUser(user);

    updateActivity();
    activityPollingRef.current = setInterval(updateActivity, 60000);

    const handleBeforeUnload = () => {
      navigator.sendBeacon(`${API_URL}/chats/offline`, JSON.stringify({ token: getAuthToken() }));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (activityPollingRef.current) {
        clearInterval(activityPollingRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      window.dispatchEvent(new Event('chatOpened'));
      
      loadChatUsers(false);
      
      userListPollingRef.current = setInterval(() => {
        loadChatUsers(true);
      }, 5000);

      return () => {
        if (userListPollingRef.current) {
          clearInterval(userListPollingRef.current);
        }
      };
    }
  }, [currentUser]);

  useEffect(() => {
    if (userId && currentUser) {
      loadUserAndMessages(parseInt(userId));
    }
  }, [userId, currentUser]);

  useEffect(() => {
    if (selectedUser && currentUser) {
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
      }
      
      messagePollingRef.current = setInterval(() => {
        loadMessages(selectedUser.id, true);
        updateSelectedUserStatus(selectedUser.id);
      }, 2000); // Increased to 2 seconds for better performance

      return () => {
        if (messagePollingRef.current) {
          clearInterval(messagePollingRef.current);
        }
      };
    }
  }, [selectedUser, currentUser]);

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
  }, [searchQuery, currentUser, chatUsers]);

  const loadChatUsers = async (silent: boolean = false) => {
    if (!silent) setLoadingUsers(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/chats/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChatUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading chat users:', error);
    } finally {
      if (!silent) setLoadingUsers(false);
    }
  };

  const loadUserAndMessages = async (targetUserId: number) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      
      const [userResponse, messagesResponse] = await Promise.all([
        fetch(`${API_URL}/users/${targetUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${API_URL}/chats/messages/${targetUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const user = userData.user || userData.data || userData;
        
        const isOnline = getOnlineStatus(user);
        
        setSelectedUser({
          ...user,
          is_online: isOnline,
          last_activity_at: user.last_activity_at,
          last_seen_at: user.last_seen_at
        });
      }

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.data || []);
        
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 100);
      }

      markMessagesAsRead(targetUserId);
    } catch (error) {
      console.error('Error loading chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (targetUserId: number, silent: boolean = false) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/chats/messages/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newMessages = data.data || [];
        
        setMessages((prevMessages) => {
          const hasNewMessages = newMessages.length > prevMessages.length;
          const hasUpdates = JSON.stringify(prevMessages) !== JSON.stringify(newMessages);
          
          if (hasUpdates) {
            if (hasNewMessages) {
              setTimeout(() => {
                if (messagesContainerRef.current && isNearBottom()) {
                  messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
              }, 100);
            }
            return newMessages;
          }
          return prevMessages;
        });
      }
    } catch (error) {
      // Silent fail
    }
  };

  const updateSelectedUserStatus = async (targetUserId: number) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/users/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const user = userData.user || userData.data || userData;
        
        const isOnline = getOnlineStatus(user);
        
        setSelectedUser(prev => prev ? {
          ...prev,
          is_online: isOnline,
          last_activity_at: user.last_activity_at,
          last_seen_at: user.last_seen_at
        } : null);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const markMessagesAsRead = async (targetUserId: number) => {
    try {
      const token = getAuthToken();
      await fetch(`${API_URL}/chats/messages/${targetUserId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedUser || sending) return;

    setSending(true);
    const tempMessage = messageText;
    
    const wasNearBottom = isNearBottom();
    
    setMessageText('');

    const optimisticMessage: Message = {
      id: Date.now(),
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      message: tempMessage,
      created_at: new Date().toISOString(),
      is_read: false,
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
      },
      receiver: {
        id: selectedUser.id,
        name: selectedUser.name,
        username: selectedUser.username,
      }
    };

    setMessages(prev => [...prev, optimisticMessage]);
    
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 100);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/chats/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: selectedUser.id,
          message: tempMessage,
        }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        const text = await response.text();
        console.error('Response text:', text);
        throw new Error('Server returned invalid response format');
      }

      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      if (response.ok) {
        if (data && data.data) {
          setMessages((prev) => {
            const filtered = prev.filter(m => m.id !== optimisticMessage.id);
            return [...filtered, data.data];
          });
        }
        
        loadChatUsers(true);
      } else {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setMessageText(tempMessage);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteConversation = async () => {
    if (!selectedUser || deletingConversation) return;

    setDeletingConversation(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/chats/conversation/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Conversation deleted successfully',
        });
        
        setMessages([]);
        setShowDeleteDialog(false);
        navigate('/chats');
        
        loadChatUsers();
      } else {
        throw new Error(data.message || 'Failed to delete conversation');
      }
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete conversation',
        variant: 'destructive',
      });
    } finally {
      setDeletingConversation(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffInHours < 48) {
      return 'Yesterday';
    }
    return date.toLocaleDateString();
  };

  const renderUserBadge = (user: ChatUser) => {
    if (user.is_founder) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs flex-shrink-0">
          <Crown className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Founder</span>
        </Badge>
      );
    }
    if (user.is_admin) {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs flex-shrink-0">
          <Shield className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Admin</span>
        </Badge>
      );
    }
    return null;
  };

  const filteredChatUsers = searchQuery.trim() 
    ? chatUsers.filter((user) => {
        const query = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          (user.email && user.email.toLowerCase().includes(query)) ||
          (user.phone && user.phone.toLowerCase().includes(query))
        );
      })
    : chatUsers;

  const displayedUsers = searchQuery.trim() 
    ? searchResults
    : filteredChatUsers;

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 md:pt-16 pt-0">
      <div className="container mx-auto px-0 sm:px-2 md:px-4 py-0 md:py-2 lg:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-4 h-[70vh] max-w-7xl mx-auto">
          
          {/* Chat Users List */}
          <Card className={`${selectedUser && userId ? 'hidden lg:flex' : 'flex'} lg:col-span-4 shadow-none md:shadow-2xl border-0 bg-white overflow-hidden flex-col h-full rounded-none md:rounded-lg`}>
            <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white pb-2 md:pb-3 pt-3 md:pt-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base font-bold">Messages</span>
                </div>
                {chatUsers.length > 0 && (
                  <Badge className="bg-white/20 text-white text-xs">{chatUsers.length}</Badge>
                )}
              </CardTitle>
              <div className="mt-2 md:mt-3 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-white/60" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search all users globally..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pl-9 md:pl-10 text-sm h-9 md:h-10"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/70 hover:text-white" />
                  </button>
                )}
                {searchingUsers && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/70 animate-spin" />
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 overflow-hidden">
              {loadingUsers ? (
                <div className="flex flex-col items-center justify-center h-full py-8 md:py-12 px-4">
                  <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-blue-500 mb-3 md:mb-4 animate-spin" />
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1 md:mb-2">
                    Loading conversations...
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 text-center">
                    Please wait
                  </p>
                </div>
              ) : displayedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 md:py-12 px-4">
                  <MessageCircle className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mb-3 md:mb-4" />
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1 md:mb-2">
                    {searchQuery ? (searchingUsers ? 'Searching all users...' : 'No users found') : 'No conversations'}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 text-center">
                    {searchQuery ? 'Try a different name, username, email or phone' : 'Search for any user to start chatting'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 overflow-y-auto h-full custom-scrollbar">
                  {displayedUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => navigate(`/chats/${user.id}`)}
                      className={`w-full p-3 md:p-4 hover:bg-gray-50 transition-all text-left ${
                        selectedUser?.id === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2 md:space-x-3">
                        <div 
                          className="relative flex-shrink-0 cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToProfile(user);
                          }}
                          title="View profile"
                        >
                          <Avatar className="w-10 h-10 md:w-12 md:h-12 ring-2 ring-transparent group-hover:ring-blue-400 transition-all">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {user.is_online && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-full transition-colors">
                            <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5 md:mb-1">
                            <div className="flex items-center space-x-1.5 md:space-x-2 min-w-0 flex-1">
                              <h4 
                                className="font-semibold text-gray-900 truncate text-xs md:text-sm hover:text-blue-600 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigateToProfile(user);
                                }}
                                title="View profile"
                              >
                                {user.name}
                              </h4>
                              {renderUserBadge(user)}
                              {user.isNewUser && (
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs flex-shrink-0">
                                  <UserPlus className="w-3 h-3 mr-1" />
                                  New
                                </Badge>
                              )}
                            </div>
                            {user.last_message && (
                              <span className="text-[10px] md:text-xs text-gray-400 ml-1 flex-shrink-0">{formatTime(user.last_message.created_at)}</span>
                            )}
                          </div>
                          <p className={`text-xs md:text-sm truncate ${user.unread_count && user.unread_count > 0 ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
                            {user.last_message?.message 
                              ? getMessagePreview(user.last_message.message)
                              : (user.isNewUser ? `Click to start chatting with @${user.username}` : 'Start a conversation')
                            }
                          </p>
                        </div>
                        {/* Only show badge if unread_count is greater than 0 */}
                        {user.unread_count && user.unread_count > 0 && (
                          <Badge className="bg-red-500 text-white text-[10px] md:text-xs flex-shrink-0 h-5 px-1.5 md:h-6 md:px-2">
                            {user.unread_count > 9 ? '9+' : user.unread_count}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Messages Area */}
          <Card className={`${!selectedUser || !userId ? 'hidden lg:flex' : 'flex'} 
            lg:col-span-8 shadow-none md:shadow-2xl border-0 bg-white flex-col 
            overflow-hidden rounded-none md:rounded-lg h-full`}>
            {selectedUser ? (
              <>
                <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white py-2 md:py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 lg:hidden p-1.5 md:p-2 h-auto"
                        onClick={() => navigate('/chats')}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                      <div 
                        className="relative cursor-pointer group"
                        onClick={() => navigateToProfile(selectedUser)}
                        title="View profile"
                      >
                        <Avatar className="w-8 h-8 md:w-10 md:h-10 ring-2 ring-white/50 group-hover:ring-white transition-all">
                          <AvatarImage src={selectedUser.avatar} />
                          <AvatarFallback className="bg-white/20 text-white font-semibold text-xs md:text-sm">
                            {selectedUser.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {selectedUser.is_online && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-full transition-colors">
                          <ExternalLink className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5 md:space-x-2">
                          <h3 
                            className="font-semibold text-white truncate text-sm md:text-base hover:underline cursor-pointer"
                            onClick={() => navigateToProfile(selectedUser)}
                            title="View profile"
                          >
                            {selectedUser.name}
                          </h3>
                          {renderUserBadge(selectedUser)}
                        </div>
                        {/* Removed the online/offline status line */}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20 p-2 h-auto"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => navigateToProfile(selectedUser)}
                          className="cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setShowDeleteDialog(true)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-2 md:p-4 bg-[#f0f2f5] custom-scrollbar scroll-smooth"
                  style={{ scrollBehavior: 'smooth', paddingBottom: '0.5rem' }}
                >
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center px-4">
                        <MessageCircle className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
                        <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1 md:mb-2">No messages yet</h3>
                        <p className="text-xs md:text-sm text-gray-500">Start the conversation by sending a message</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 md:space-y-4">
                      {messages.map((message, index) => {
                        const isOwnMessage = Number(message.sender_id) === Number(currentUser.id);
                        const prevMessage = index > 0 ? messages[index - 1] : null;
                        const showAvatar = !prevMessage || Number(prevMessage.sender_id) !== Number(message.sender_id);
                        
                        const propertyData = parsePropertyMessage(message.message);

                        if (isOwnMessage) {
                          return (
                            <div key={message.id} className="flex justify-end">
                              <div className="flex items-end max-w-[85%] md:max-w-[70%]">
                                <div className="flex flex-col items-end">
                                  {propertyData ? (
                                    <div className="mb-1">
                                      <PropertyMessageCard propertyData={propertyData} />
                                    </div>
                                  ) : (
                                    <div className="rounded-2xl px-3 py-2 md:px-4 md:py-2.5 shadow-md bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md">
                                      <p className="text-xs md:text-sm leading-relaxed break-words whitespace-pre-wrap">
                                        {message.message}
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-1 mt-0.5 md:mt-1 px-1">
                                    <span className="text-[10px] md:text-xs text-gray-500">{formatTime(message.created_at)}</span>
                                    {message.is_read || message.read_at ? (
                                      <CheckCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-500" />
                                    ) : (
                                      <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div key={message.id} className="flex justify-start">
                              <div className="flex items-end space-x-1.5 md:space-x-2 max-w-[85%] md:max-w-[70%]">
                                {showAvatar ? (
                                  <div 
                                    className="cursor-pointer group relative"
                                    onClick={() => navigateToProfile(selectedUser)}
                                    title="View profile"
                                  >
                                    <Avatar className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0 ring-2 ring-transparent group-hover:ring-blue-400 transition-all">
                                      <AvatarImage src={selectedUser.avatar} />
                                      <AvatarFallback className="bg-gray-400 text-white text-[10px] md:text-xs font-semibold">
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-full transition-colors">
                                      <ExternalLink className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0" />
                                )}
                                <div className="flex flex-col items-start">
                                  {propertyData ? (
                                    <div className="mb-1">
                                      <PropertyMessageCard propertyData={propertyData} />
                                    </div>
                                  ) : (
                                    <div className="rounded-2xl px-3 py-2 md:px-4 md:py-2.5 shadow-sm bg-white border border-gray-200 rounded-bl-md">
                                      <p className="text-xs md:text-sm leading-relaxed break-words whitespace-pre-wrap text-gray-800">
                                        {message.message}
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-1 mt-0.5 md:mt-1 px-1">
                                    <span className="text-[10px] md:text-xs text-gray-500">{formatTime(message.created_at)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      })}
                      <div ref={messagesEndRef} />
                      
                      {otherUserTyping && (
                        <div className="flex justify-start">
                          <div className="flex items-end space-x-1.5 md:space-x-2">
                            <Avatar className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0">
                              <AvatarImage src={selectedUser.avatar} />
                              <AvatarFallback className="bg-gray-400 text-white text-[10px] md:text-xs font-semibold">
                                {selectedUser.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="rounded-2xl px-4 py-3 shadow-sm bg-white border border-gray-200">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>

                {/* Typing Input - Reduced padding for mobile */}
                <div className="p-2 border-t bg-white md:p-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      inputMode="text"
                      type="text"
                      pattern="[A-Za-z0-9]*"
                      style={{ fontSize: '16px' }}
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={sending}
                      className="flex-1 border-2 border-gray-200 rounded-full focus:border-blue-400 text-sm h-10 md:h-9 px-3"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!messageText.trim() || sending}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-3 md:px-5 h-9"
                    >
                      {sending ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Send className="w-4 h-4 md:w-5 md:h-5" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center px-4">
                  <MessageCircle className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">Select a Chat</h3>
                  <p className="text-sm md:text-base text-gray-500">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border-2 border-gray-200 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-700 font-medium">
              Do you confirm to delete this chat?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingConversation} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteConversation}
              disabled={deletingConversation}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              {deletingConversation ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        @media (min-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6, #6366f1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb, #4f46e5);
        }
      `}</style>
    </div>
  );
};