import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Star, MessageCircle, Send, X, Heart, Loader2 } from 'lucide-react';
import { API_URL } from '@/config/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  canDelete?: boolean;
}

interface PropertyCommentsProps {
  propertyId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyComments: React.FC<PropertyCommentsProps> = ({
  propertyId,
  isOpen,
  onClose,
}) => {
  const { isRTL } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null); // New state for solid confirm tab

  const bottomSheetRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && propertyId) {
      document.body.style.overflow = 'hidden';
      fetchComments(propertyId);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, propertyId]);

// Complete updated fetchComments function for PropertyComments.tsx
// Replace the entire fetchComments function (lines ~56-87) with this:
const fetchComments = async (propId: string) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    
    // Add authorization header if token exists
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Auth token present:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No auth token found');
    }
    
    console.log('📤 Fetching comments with headers:', headers);
    
    const response = await fetch(`${API_URL}/properties/${propId}/comments`, {
      headers,
    });
    
    const data = await response.json();
    
    console.log('📥 Comments response:', {
      success: data.success,
      commentsCount: data.data?.comments?.length || 0,
      firstCommentCanDelete: data.data?.comments?.[0]?.canDelete,
      allComments: data.data?.comments?.map((c: any) => ({
        id: c.id,
        canDelete: c.canDelete,
        userId: c.userId
      }))
    });
    
    if (response.ok && data.success) {
      setComments(data.data.comments || []);
      setAverageRating(data.data.averageRating || 0);
      setTotalRatings(data.data.totalComments || 0);
    } else {
      toast({
        title: isRTL ? 'فشل تحميل التعليقات' : 'Failed to load comments',
        variant: 'destructive',
      });
    }
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    toast({
      title: isRTL ? 'خطأ في الخادم' : 'Server Error',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};

// DEBUGGING STEPS:
// 1. Open browser DevTools Console
// 2. Open comments modal
// 3. Check the console logs:
//    - "🔍 Fetching comments" should show hasToken: true and hasAuthHeader: true
//    - "📥 Comments response" should show sampleCanDelete: true/false
// 4. If hasToken is false, check localStorage for 'auth_token'
// 5. If sampleCanDelete is always false, check Laravel logs for authentication issues

const handleSubmitComment = async () => {
  if (!newComment.trim() || userRating === 0 || !propertyId) return;

  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    toast({
      title: isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please login first',
      description: isRTL ? 'يجب عليك تسجيل الدخول لإضافة تعليق' : 'You must be logged in to add a comment',
      variant: 'destructive',
    });
    return;
  }

  setSubmitting(true);
  try {
    const response = await fetch(`${API_URL}/properties/${propertyId}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
        body: JSON.stringify({
          rating: userRating,
          comment: newComment,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchComments(propertyId);
        setNewComment('');
        setUserRating(0);
        toast({
          title: isRTL ? 'تم إضافة التعليق بنجاح' : 'Comment added successfully',
          description: isRTL ? 'شكراً لمشاركتك!' : 'Thank you for your feedback!',
        });
      } else {
        toast({
          title: data.message || (isRTL ? 'فشل إضافة التعليق' : 'Failed to add comment'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: isRTL ? 'حدث خطأ أثناء إضافة التعليق' : 'Error adding comment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!propertyId) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/properties/${propertyId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setTotalRatings(prev => prev - 1);
        toast({
          title: isRTL ? 'تم حذف التعليق بنجاح' : 'Comment deleted successfully',
        });
        await fetchComments(propertyId);
      } else {
        toast({
          title: data.message || (isRTL ? 'فشل حذف التعليق' : 'Failed to delete comment'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: isRTL ? 'حدث خطأ أثناء حذف التعليق' : 'Error deleting comment',
        variant: 'destructive',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!propertyId) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/properties/${propertyId}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setComments(prev =>
          prev.map(c =>
            c.id === commentId
              ? { ...c, likes: data.data.likes, isLiked: data.data.liked }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const formatTimestamp = useCallback(
    (timestamp: string) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 0) return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
      if (hours > 0) return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
      return isRTL ? 'الآن' : 'Just now';
    },
    [isRTL]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        ref={bottomSheetRef}
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up sm:max-w-lg sm:mx-auto"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b sticky top-0 bg-white z-10 ${
            isRTL ? 'flex-row-reverse' : ''
          }`}
        >
          <div className={`flex items-center gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MessageCircle className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {isRTL ? 'التعليقات والتقييمات' : 'Comments & Ratings'}
              </h3>
              <div
                className={`flex items-center gap-2 text-xs sm:text-sm text-gray-600 ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}
              >
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
                <span>({totalRatings} {isRTL ? 'تقييم' : 'ratings'})</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 sm:space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">
                {isRTL ? 'جاري التحميل...' : 'Loading comments...'}
              </p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {isRTL ? 'لا توجد تعليقات بعد.' : 'No comments yet.'}
              </p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="bg-gray-50 rounded-2xl p-3 sm:p-4">
                <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/profile/${comment.userId}`)}
                  >
                    {comment.userAvatar?.startsWith('http') ? (
                      <img
                        src={comment.userAvatar}
                        alt={comment.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{comment.userAvatar || comment.userName[0]}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`flex items-center justify-between mb-2 ${
                        isRTL ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className="truncate">
                        <h4
                          className={`font-semibold text-gray-900 text-sm sm:text-base cursor-pointer hover:text-purple-600 ${
                            isRTL ? 'text-right' : ''
                          }`}
                          onClick={() => navigate(`/profile/${comment.userId}`)}
                        >
                          {comment.userName}
                        </h4>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                                i < comment.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(comment.timestamp)}
                      </span>
                    </div>

                    <p className={`text-gray-700 text-sm mb-3 break-words ${isRTL ? 'text-right' : ''}`}>
                      {comment.comment}
                    </p>

                    <div
                      className={`flex items-center justify-between ${
                        isRTL ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className="flex items-center gap-1 text-gray-600 hover:text-red-500"
                      >
                        <Heart
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            comment.isLiked ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                        <span className="text-xs sm:text-sm">{comment.likes}</span>
                      </button>

                      {comment.canDelete && (
                        <button
                          onClick={() => setDeleteTarget(comment.id)}
                          className="text-xs sm:text-sm text-red-600 hover:underline"
                        >
                          {isRTL ? 'حذف' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Section */}
        <div className="border-t bg-white p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div
            className={`flex items-center justify-center gap-2 ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {isRTL ? 'قيم هذا العقار:' : 'Rate this property:'}
            </span>
            <div className="flex gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  disabled={submitting}
                >
                  <Star
                    className={`w-6 h-6 sm:w-8 sm:h-8 ${
                      star <= (hoverRating || userRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder={isRTL ? 'أضف تعليقاً...' : 'Add a comment...'}
              className={`flex-1 rounded-full border-2 px-3 sm:px-4 py-2 text-sm sm:text-base ${
                isRTL ? 'text-right' : ''
              }`}
              disabled={submitting}
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || userRating === 0 || submitting}
              className="rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 🔒 Solid Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 text-center space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-900">
              {isRTL ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </h3>
            <p className="text-gray-600 text-sm">
              {isRTL
                ? 'هل أنت متأكد أنك تريد حذف هذا التعليق؟ لا يمكن التراجع بعد الحذف.'
                : 'Are you sure you want to delete this comment? This action cannot be undone.'}
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full px-6 py-2"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                onClick={() => handleDeleteComment(deleteTarget)}
                className="rounded-full px-6 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                {isRTL ? 'حذف' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyComments;
