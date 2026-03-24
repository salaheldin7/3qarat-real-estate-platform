import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken, getUser, isAuthenticated } from "@/utils/auth";
import { Textarea } from "@/components/ui/textarea";
import { API_URL, getImageUrl } from "@/config/api";
import { 
  Users, 
  Home, 
  MessageSquare, 
  MapPin, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Ban, 
  UserCheck,
  Search,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Building,
  Shield,
  AlertCircle,
  Loader2,
  RefreshCw,
  Trash2,
  Plus,
  Edit3,
  Power,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  is_admin: boolean;
  is_seller: boolean;
  is_founder: boolean;
  banned: boolean;
  created_at: string;
  properties_count?: number;
}

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location_governorate: string;
  location_city: string;
  category: string;
  rent_or_buy: string;
  status: string;
  images: string[];
  created_at: string;
  rejection_reason?: string;
  is_active?: boolean;
  user: {
    id: string;
    name: string;
    username: string;
  };
}

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  property_interest: string;
  status: string;
  created_at: string;
}

interface Chat {
  id: string;
  sender: { id: string; name: string; username: string };
  receiver: { id: string; name: string; username: string };
  message: string;
  created_at: string;
  property?: { id: string; title: string };
}

interface Governorate {
  id: string;
  name_en: string;
  name_ar: string;
  cities: City[];
}

interface City {
  id: string;
  name_en: string;
  name_ar: string;
  governorate_id: string;
}

interface LoadingState {
  auth: boolean;
  users: boolean;
  properties: boolean;
  contacts: boolean;
  chats: boolean;
  locations: boolean;
}

const Admin = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]); // Pending properties only
  const [allProperties, setAllProperties] = useState<Property[]>([]); // All properties for management
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    auth: true,
    users: true,
    properties: true,
    contacts: true,
    chats: false,
    locations: true
  });
  const [loadingAllProperties, setLoadingAllProperties] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFounder, setIsFounder] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userChats, setUserChats] = useState<any[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<any | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [propertyUsernameSearch, setPropertyUsernameSearch] = useState("");
const [filteredByUser, setFilteredByUser] = useState<{ username: string; user: any } | null>(null);
  // Location management states
  const [showAddGovernorateModal, setShowAddGovernorateModal] = useState(false);
  const [showAddCityModal, setShowAddCityModal] = useState<string | null>(null);
  const [showEditGovernorateModal, setShowEditGovernorateModal] = useState<Governorate | null>(null);
  const [showEditCityModal, setShowEditCityModal] = useState<City | null>(null);
  const [newGovernorate, setNewGovernorate] = useState({ name_en: '', name_ar: '' });
  const [newCity, setNewCity] = useState({ name_en: '', name_ar: '' });
  const [editGovernorate, setEditGovernorate] = useState({ name_en: '', name_ar: '' });
  const [editCity, setEditCity] = useState({ name_en: '', name_ar: '' });
  
  // Pagination states for different tabs
  const [currentPage, setCurrentPage] = useState({
    properties: 1,
    users: 1,
    contacts: 1,
    contactHistory: 1,
    locations: 1,
    propertyManagement: 1,
    approvals: 1
  });
  const itemsPerPage = 8;
  const usersPerPage = 10;
  // Add search state for users
const [userSearchQuery, setUserSearchQuery] = useState("");
  // Collapsible governorates state
  const [expandedGovernorates, setExpandedGovernorates] = useState<Set<string>>(new Set());
  
  // Expand/collapse for items
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());
  const [expandedContacts, setExpandedContacts] = useState<Set<string>>(new Set());
  
  // Store reset links for each user (userId -> { token, resetLink })
  const [userResetLinks, setUserResetLinks] = useState<Record<string, { token: string; resetLink: string }>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Memoized calculations with array safety checks
  const stats = useMemo(() => ({
    totalUsers: Array.isArray(users) ? users.length : 0,
    adminUsers: Array.isArray(users) ? users.filter(u => u.is_admin && !u.is_founder).length : 0,
    founderUsers: Array.isArray(users) ? users.filter(u => u.is_founder).length : 0,
    bannedUsers: Array.isArray(users) ? users.filter(u => u.banned).length : 0,
    sellerUsers: Array.isArray(users) ? users.filter(u => u.is_seller).length : 0,
    pendingProperties: Array.isArray(properties) ? properties.length : 0,
    totalContacts: Array.isArray(contactRequests) ? contactRequests.length : 0,
    totalGovernorates: Array.isArray(governorates) ? governorates.length : 0,
    totalCities: Array.isArray(governorates) ? governorates.reduce((total, gov) => total + (gov.cities?.length || 0), 0) : 0
  }), [users, properties, contactRequests, governorates]);
const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    if (!userSearchQuery.trim()) return users;
    
    const query = userSearchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone && user.phone.toLowerCase().includes(query))
    );
  }, [users, userSearchQuery]);
  // Check authentication and admin status
  const checkAuth = useCallback(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return null;
    }
    
    const user = getUser();
    const token = getAuthToken();
    
    if (!user || !token) {
      navigate("/login");
      return null;
    }
    
    if (!user.is_admin && !user.is_founder) {
      navigate("/");
      return null;
    }
    
    setIsAdmin(user.is_admin || user.is_founder);
    setIsFounder(user.is_founder || false);
    return { token, user };
  }, [navigate]);

  // API helper function with better error handling
  const makeApiRequest = async (url: string, options: RequestInit = {}) => {
    const authData = checkAuth();
    if (!authData) throw new Error('Not authenticated');

    const defaultHeaders = {
      'Authorization': `Bearer ${authData.token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        navigate('/login');
        throw new Error('Authentication expired');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  };

  // Initialize admin
  const initializeAdmin = useCallback(async () => {
    const authData = checkAuth();
    if (!authData) return;

    setIsAdmin(true);
    setLoading(prev => ({ ...prev, auth: false }));
  }, [checkAuth]);

  // Load users data with better error handling
  const loadUsers = useCallback(async () => {
    const authData = checkAuth();
    if (!authData) return;

    try {
      setLoading(prev => ({ ...prev, users: true }));
      setError(null);
      
      const data = await makeApiRequest(`${API_URL}/admin/users`);
      console.log('Users API response:', data);
      
      // Handle different response formats more robustly
      let usersData = [];
      if (Array.isArray(data)) {
        usersData = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.users)) {
          usersData = data.users;
        } else if (Array.isArray(data.data)) {
          usersData = data.data;
        } else if (Array.isArray(data.results)) {
          usersData = data.results;
        }
      }
      
      // Ensure each user has required properties
      usersData = usersData.map(user => ({
        id: user.id || '',
        name: user.name || 'Unknown',
        username: user.username || 'unknown',
        email: user.email || '',
        phone: user.phone || '',
        is_admin: Boolean(user.is_admin),
        is_seller: Boolean(user.is_seller),
        banned: Boolean(user.banned),
        created_at: user.created_at || new Date().toISOString(),
        properties_count: user.properties_count || 0
      }));
      
      console.log('Processed users data:', usersData);
      setUsers(usersData);
      
      if (usersData.length === 0) {
        console.warn('No users found in response');
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
      if (error.message !== 'Not authenticated') {
        setError(`Failed to load users: ${error.message}`);
      }
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [checkAuth, navigate]);

  // Load properties data with better error handling
  const loadProperties = useCallback(async () => {
    const authData = checkAuth();
    if (!authData) return;

    try {
      setLoading(prev => ({ ...prev, properties: true }));
      setError(null);
      
      const data = await makeApiRequest(`${API_URL}/admin/properties/pending`);
      console.log('Properties API response:', data);
      
      // Handle different response formats more robustly
      let propertiesData = [];
      if (Array.isArray(data)) {
        propertiesData = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.properties)) {
          propertiesData = data.properties;
        } else if (Array.isArray(data.data)) {
          propertiesData = data.data;
        } else if (Array.isArray(data.results)) {
          propertiesData = data.results;
        }
      }
      
      // Ensure each property has required properties
      propertiesData = propertiesData.map(property => ({
        id: property.id || '',
        title: property.title || 'Untitled Property',
        description: property.description || '',
        price: Number(property.price) || 0,
        location_governorate: property.location_governorate || '',
        location_city: property.location_city || '',
        category: property.category || '',
        rent_or_buy: property.rent_or_buy || 'rent',
        status: property.status || 'pending',
        images: Array.isArray(property.images) ? property.images : [],
        created_at: property.created_at || new Date().toISOString(),
        user: {
          id: property.user?.id || '',
          name: property.user?.name || 'Unknown',
          username: property.user?.username || 'unknown'
        }
      }));
      
      console.log('Processed properties data:', propertiesData);
      setProperties(propertiesData);
    } catch (error) {
      console.error("Error loading properties:", error);
      setProperties([]);
      if (error.message !== 'Not authenticated') {
        setError(`Failed to load properties: ${error.message}`);
      }
    } finally {
      setLoading(prev => ({ ...prev, properties: false }));
    }
  }, [checkAuth, navigate]);

  // Load contact requests with better error handling
  const loadContacts = useCallback(async () => {
    const authData = checkAuth();
    if (!authData) return;

    try {
      setLoading(prev => ({ ...prev, contacts: true }));
      setError(null);
      
      // Request all contact requests without status filter
      const data = await makeApiRequest(`${API_URL}/admin/contact-requests?per_page=100`);
      console.log('Contacts API response:', data);
      
      // Handle different response formats more robustly
      let contactsData = [];
      if (Array.isArray(data)) {
        contactsData = data;
      } else if (data && typeof data === 'object') {
        // Handle Laravel pagination format
        if (data.data && typeof data.data === 'object' && Array.isArray(data.data.data)) {
          contactsData = data.data.data;
        } else if (Array.isArray(data.data)) {
          contactsData = data.data;
        } else if (Array.isArray(data.contacts)) {
          contactsData = data.contacts;
        } else if (Array.isArray(data.results)) {
          contactsData = data.results;
        }
      }
      
      // Ensure each contact has required properties
      contactsData = contactsData.map(contact => ({
        id: contact.id || '',
        name: contact.name || 'Unknown',
        email: contact.email || '',
        phone: contact.phone || '',
        subject: contact.subject || '',
        message: contact.message || '',
        property_interest: contact.property_interest || '',
        status: contact.status || 'pending',
        created_at: contact.created_at || new Date().toISOString()
      }));
      
      console.log('Processed contacts data:', contactsData);
      setContactRequests(contactsData);
    } catch (error) {
      console.error("Error loading contact requests:", error);
      setContactRequests([]);
      if (error.message !== 'Not authenticated') {
        setError(`Failed to load contacts: ${error.message}`);
      }
    } finally {
      setLoading(prev => ({ ...prev, contacts: false }));
    }
  }, [checkAuth, navigate]);

  // Load all properties for management
  // Load all properties for management
const loadAllProperties = useCallback(async () => {
  const authData = checkAuth();
  if (!authData) return;

  try {
    setLoadingAllProperties(true);
    setError(null);
    setFilteredByUser(null); // ⬅️ ADD THIS LINE

    const response = await makeApiRequest(`${API_URL}/admin/properties`);
    const propertiesData = response.data || response || [];
    
    setAllProperties(Array.isArray(propertiesData) ? propertiesData : []);
  } catch (error) {
    console.error('Error loading all properties:', error);
    toast({
      title: "Error",
      description: "Failed to load properties",
      variant: "destructive",
    });
  } finally {
    setLoadingAllProperties(false);
  }
}, [checkAuth, toast]);
  
  // Load properties by username
const loadPropertiesByUsername = useCallback(async (username: string) => {
  const authData = checkAuth();
  if (!authData) return;

  if (!username.trim()) {
    toast({
      title: "Username required",
      description: "Please enter a username to search",
      variant: "destructive",
    });
    return;
  }

  try {
    setLoadingAllProperties(true);
    setError(null);

    const response = await makeApiRequest(`${API_URL}/admin/properties/by-username?username=${encodeURIComponent(username.trim())}`);
    const propertiesData = response.data || [];
    const userData = response.user || null;
    
    setAllProperties(Array.isArray(propertiesData) ? propertiesData : []);
    setFilteredByUser({ username: username.trim(), user: userData });
    setCurrentPage(prev => ({ ...prev, propertyManagement: 1 })); // Reset to page 1
    
    toast({
      title: "Search complete",
      description: response.message || `Found ${propertiesData.length} properties`,
    });
  } catch (error: any) {
    console.error('Error loading properties by username:', error);
    
    if (error.message.includes('User not found')) {
      toast({
        title: "User not found",
        description: `No user found with username "${username}"`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    }
    
    setAllProperties([]);
    setFilteredByUser(null);
  } finally {
    setLoadingAllProperties(false);
  }
}, [checkAuth, toast]);
  // Load locations data
  // Load locations data
  const loadLocations = useCallback(async () => {
    const authData = checkAuth();
    if (!authData) return;

    try {
      setLoading(prev => ({ ...prev, locations: true }));
      setError(null);
      
      // Use the correct endpoint
      const data = await makeApiRequest(`${API_URL}/governorates`);
      console.log('Locations API response:', data);
      
      // Handle different response formats
      let locationsData = [];
      if (Array.isArray(data)) {
        locationsData = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.governorates)) {
          locationsData = data.governorates;
        } else if (Array.isArray(data.data)) {
          locationsData = data.data;
        } else if (Array.isArray(data.results)) {
          locationsData = data.results;
        }
      }
      
      // Initialize governorates with empty cities array immediately for fast display
      const governoratesWithEmptyCities = locationsData.map(gov => ({
        id: gov.id || '',
        name_en: gov.name_en || gov.name || '',
        name_ar: gov.name_ar || gov.name || '',
        cities: []
      }));
      
      // Set governorates immediately - no delay!
      setGovernorates(governoratesWithEmptyCities);
      setLoading(prev => ({ ...prev, locations: false }));
      
      // Load cities in the background (non-blocking)
      Promise.all(
        locationsData.map(async (gov, index) => {
          try {
            const citiesResponse = await makeApiRequest(`${API_URL}/governorates/${gov.id}/cities`);
            const cities = citiesResponse.data || citiesResponse || [];
            
            return {
              index,
              governorate: {
                id: gov.id || '',
                name_en: gov.name_en || gov.name || '',
                name_ar: gov.name_ar || gov.name || '',
                cities: Array.isArray(cities) ? cities.map(city => ({
                  id: city.id || '',
                  name_en: city.name_en || city.name || '',
                  name_ar: city.name_ar || city.name || '',
                  governorate_id: city.governorate_id || gov.id || ''
                })) : []
              }
            };
          } catch (error) {
            console.error(`Failed to load cities for governorate ${gov.id}:`, error);
            return {
              index,
              governorate: {
                id: gov.id || '',
                name_en: gov.name_en || gov.name || '',
                name_ar: gov.name_ar || gov.name || '',
                cities: []
              }
            };
          }
        })
      ).then(results => {
        // Update governorates with their cities progressively
        setGovernorates(prev => {
          const updated = [...prev];
          results.forEach(result => {
            if (result && updated[result.index]) {
              updated[result.index] = result.governorate;
            }
          });
          return updated;
        });
        console.log('All cities loaded');
      });
      
    } catch (error) {
      console.error("Error loading locations:", error);
      setGovernorates([]);
      // Don't set global error for locations - they're not critical for chat management
      // Only log to console
      setLoading(prev => ({ ...prev, locations: false }));
    }
  }, [checkAuth, navigate]);

  // Initialize data on mount
  useEffect(() => {
    initializeAdmin();
    
    // Load all essential data immediately including locations
    const timers = [
      setTimeout(loadUsers, 100),
      setTimeout(loadProperties, 200),
      setTimeout(loadContacts, 300),
      setTimeout(loadLocations, 400), // ✅ Load locations on mount
    ];

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [initializeAdmin, loadUsers, loadProperties, loadContacts, loadLocations]);

  // Refresh all data
  const refreshAllData = useCallback(() => {
    setError(null);
    loadUsers();
    loadProperties();
    loadContacts();
    loadLocations();
  }, [loadUsers, loadProperties, loadContacts, loadLocations]);

  // Property actions
  const approveProperty = async (propertyId: string) => {
    setActionLoading(`approve-${propertyId}`);
    try {
      await makeApiRequest(`${API_URL}/admin/properties/${propertyId}/approve`, {
        method: 'POST',
      });

      toast({
        title: "Property approved",
        description: "Property has been approved and is now live.",
      });

      setProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error approving property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve property",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const rejectProperty = async (propertyId: string, reason: string) => {
    setActionLoading(`reject-${propertyId}`);
    try {
      await makeApiRequest(`${API_URL}/admin/properties/${propertyId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      toast({
        title: "Property rejected",
        description: "Property has been rejected and seller has been notified.",
      });

      setShowRejectionModal(null);
      setRejectionReason("");
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error rejecting property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject property",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const togglePropertyActive = async (propertyId: string, currentStatus: boolean) => {
    setActionLoading(`toggle-${propertyId}`);
    try {
      const response = await makeApiRequest(`${API_URL}/admin/properties/${propertyId}/toggle-active`, {
        method: 'POST',
      });

      const newStatus = response.data.is_active;

      toast({
        title: newStatus ? "Property activated" : "Property deactivated",
        description: newStatus 
          ? "Property is now visible in marketplace" 
          : "Property is now hidden from marketplace",
      });

      setProperties(prev => prev.map(p => 
        p.id === propertyId ? { ...p, is_active: newStatus } : p
      ));
      
      // Also update allProperties if loaded
      setAllProperties(prev => prev.map(p => 
        p.id === propertyId ? { ...p, is_active: newStatus } : p
      ));
    } catch (error) {
      console.error('Error toggling property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to toggle property status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    setActionLoading(`delete-${propertyId}`);
    try {
      await makeApiRequest(`${API_URL}/admin/properties/${propertyId}`, {
        method: 'DELETE',
      });

      toast({
        title: "Property deleted",
        description: "Property has been permanently deleted.",
      });

      // Remove from both lists
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      setAllProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete property",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // User actions
  const banUser = async (userId: string) => {
    setActionLoading(`ban-${userId}`);
    try {
      await makeApiRequest(`${API_URL}/admin/users/${userId}/ban`, {
        method: 'PUT',
      });

      toast({
        title: "User banned",
        description: "User has been banned successfully.",
      });

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: true } : u));
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to ban user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const unbanUser = async (userId: string) => {
    setActionLoading(`unban-${userId}`);
    try {
      await makeApiRequest(`${API_URL}/admin/users/${userId}/unban`, {
        method: 'PUT',
      });

      toast({
        title: "User unbanned",
        description: "User has been unbanned successfully.",
      });

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: false } : u));
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to unban user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

 const resetUserPassword = async (userId: string) => {
  setActionLoading(`reset-${userId}`);
  try {
    const response = await makeApiRequest(`${API_URL}/admin/users/${userId}/generate-reset-token`, {
      method: 'POST',
    });
    
    const resetData = response.data || response;
    
    if (resetData.email_sent) {
      toast({
        title: "✅ Email Sent Successfully!",
        description: `Password reset link has been sent to the user's email: ${resetData.email}`,
      });
    } else {
      // Email failed but token was generated
      const resetLink = `${window.location.origin}/reset-password?token=${resetData.token}`;
      
      setUserResetLinks(prev => ({
        ...prev,
        [userId]: {
          token: resetData.token,
          resetLink: resetLink
        }
      }));

      toast({
        title: "⚠️ Link Generated (Email Failed)",
        description: `Reset link generated but email failed to send. Copy the link below to share with user.`,
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('Error generating reset token:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to generate reset token",
      variant: "destructive",
    });
  } finally {
    setActionLoading(null);
  }
};
  const deleteUser = async (userId: string, userName: string) => {
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(`delete-${userId}`);
    try {
      await makeApiRequest(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
      });

      toast({
        title: "User deleted",
        description: `User "${userName}" has been permanently deleted.`,
      });

      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const promoteToAdmin = async (userId: string, userName: string) => {
    if (!window.confirm(`Promote "${userName}" to Admin? They will gain admin privileges.`)) {
      return;
    }

    setActionLoading(`promote-${userId}`);
    try {
      const data = await makeApiRequest(`${API_URL}/admin/users/${userId}/promote`, {
        method: 'PUT',
      });

      toast({
        title: "User promoted",
        description: `${userName} has been promoted to Admin.`,
      });

      // Update local user state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_admin: true, is_seller: true } : u
      ));
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to promote user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const demoteToUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Demote "${userName}" from Admin to regular user? They will lose admin privileges.`)) {
      return;
    }

    setActionLoading(`demote-${userId}`);
    try {
      const data = await makeApiRequest(`${API_URL}/admin/users/${userId}/demote`, {
        method: 'PUT',
      });

      toast({
        title: "User demoted",
        description: `${userName} has been demoted to regular user.`,
      });

      // Update local user state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_admin: false } : u
      ));
    } catch (error) {
      console.error('Error demoting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to demote user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Chat actions
  const searchUserChats = async () => {
    if (!searchUsername.trim()) {
      toast({
        title: "Enter username",
        description: "Please enter a username to search for chats.",
        variant: "destructive",
      });
      return;
    }

    setLoading(prev => ({ ...prev, chats: true }));
    try {
      // First find the user
      const user = Array.isArray(users) ? users.find(u => u.username.toLowerCase() === searchUsername.toLowerCase()) : null;
      if (!user) {
        toast({
          title: "User not found",
          description: "No user found with that username.",
          variant: "destructive",
        });
        return;
      }

      setSelectedUser(user);
      setSelectedChatUser(null);
      setConversationMessages([]);

      // Get user's chat conversations (list of people they've chatted with)
      const data = await makeApiRequest(`${API_URL}/admin/chats/user/${user.id}`);
      
      const chatUsersData = data.chat_users || [];
      setUserChats(Array.isArray(chatUsersData) ? chatUsersData : []);

      toast({
        title: "Chats loaded",
        description: `Found ${chatUsersData.length} conversations for ${user.username}.`,
      });
    } catch (error) {
      console.error('Error searching chats:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch user chats",
        variant: "destructive",
      });
      setUserChats([]);
    } finally {
      setLoading(prev => ({ ...prev, chats: false }));
    }
  };

  const loadConversation = async (chatUser: any) => {
    if (!selectedUser) return;

    setSelectedChatUser(chatUser);
    setLoadingConversation(true);

    try {
      const data = await makeApiRequest(
        `${API_URL}/admin/chats/conversation/${selectedUser.id}/${chatUser.id}`
      );
      
      setConversationMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
      setConversationMessages([]);
    } finally {
      setLoadingConversation(false);
    }
  };

  // Contact actions
  const markContactResolved = async (contactId: string) => {
    setActionLoading(`resolve-${contactId}`);
    try {
      await makeApiRequest(`${API_URL}/admin/contact-requests/${contactId}/resolve`, {
        method: 'PUT',
      });

      toast({
        title: "Contact resolved",
        description: "Contact request has been marked as resolved.",
      });

      setContactRequests(prev => prev.filter(c => c.id !== contactId));
    } catch (error) {
      console.error('Error resolving contact:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to resolve contact request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteContact = async (contactId: string) => {
    setActionLoading(`delete-${contactId}`);
    try {
      await makeApiRequest(`${API_URL}/admin/contact-requests/${contactId}`, {
        method: 'DELETE',
      });

      toast({
        title: "Contact deleted",
        description: "Contact request has been deleted.",
      });

      setContactRequests(prev => prev.filter(c => c.id !== contactId));
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete contact request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Location management actions
  const addGovernorate = async () => {
    if (!newGovernorate.name_en.trim() || !newGovernorate.name_ar.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both English and Arabic names.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading('add-governorate');
    try {
      const data = await makeApiRequest(`${API_URL}/admin/governorates`, {
        method: 'POST',
        body: JSON.stringify(newGovernorate),
      });

      toast({
        title: "Governorate added",
        description: `${newGovernorate.name_en} has been added successfully.`,
      });

      // Add to local state
      const newGov: Governorate = {
        id: data.id || Date.now().toString(),
        name_en: newGovernorate.name_en,
        name_ar: newGovernorate.name_ar,
        cities: []
      };
      setGovernorates(prev => [...prev, newGov]);

      // Reset form
      setNewGovernorate({ name_en: '', name_ar: '' });
      setShowAddGovernorateModal(false);
    } catch (error) {
      console.error('Error adding governorate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add governorate",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const addCity = async (governorateId: string) => {
    if (!newCity.name_en.trim() || !newCity.name_ar.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both English and Arabic names.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(`add-city-${governorateId}`);
    try {
      const data = await makeApiRequest(`${API_URL}/admin/cities`, {
        method: 'POST',
        body: JSON.stringify({
          ...newCity,
          governorate_id: governorateId
        }),
      });

      toast({
        title: "City added",
        description: `${newCity.name_en} has been added successfully.`,
      });

      // Add to local state
      const newCityObj: City = {
        id: data.id || Date.now().toString(),
        name_en: newCity.name_en,
        name_ar: newCity.name_ar,
        governorate_id: governorateId
      };
      
      setGovernorates(prev => prev.map(gov => 
        gov.id === governorateId 
          ? { ...gov, cities: [...(gov.cities || []), newCityObj] }
          : gov
      ));

      // Reset form
      setNewCity({ name_en: '', name_ar: '' });
      setShowAddCityModal(null);
    } catch (error) {
      console.error('Error adding city:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add city",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const updateGovernorate = async () => {
    if (!showEditGovernorateModal || !editGovernorate.name_en.trim() || !editGovernorate.name_ar.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both English and Arabic names.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(`edit-gov-${showEditGovernorateModal.id}`);
    try {
      await makeApiRequest(`${API_URL}/admin/governorates/${showEditGovernorateModal.id}`, {
        method: 'PUT',
        body: JSON.stringify(editGovernorate),
      });

      toast({
        title: "Governorate updated",
        description: `${editGovernorate.name_en} has been updated successfully.`,
      });

      // Update local state
      setGovernorates(prev => prev.map(gov => 
        gov.id === showEditGovernorateModal.id 
          ? { ...gov, name_en: editGovernorate.name_en, name_ar: editGovernorate.name_ar }
          : gov
      ));

      setShowEditGovernorateModal(null);
      setEditGovernorate({ name_en: '', name_ar: '' });
    } catch (error: any) {
      console.error('Error updating governorate:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update governorate",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteGovernorate = async (governorateId: string) => {
    if (!confirm('Are you sure you want to delete this governorate? All associated cities will also be deleted.')) {
      return;
    }

    setActionLoading(`delete-gov-${governorateId}`);
    try {
      await makeApiRequest(`${API_URL}/admin/governorates/${governorateId}`, {
        method: 'DELETE',
      });

      toast({
        title: "Governorate deleted",
        description: "Governorate and its cities have been deleted successfully.",
      });

      // Remove from local state
      setGovernorates(prev => prev.filter(gov => gov.id !== governorateId));
    } catch (error: any) {
      console.error('Error deleting governorate:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete governorate",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const updateCity = async () => {
    if (!showEditCityModal || !editCity.name_en.trim() || !editCity.name_ar.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both English and Arabic names.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(`edit-city-${showEditCityModal.id}`);
    try {
      await makeApiRequest(`${API_URL}/admin/cities/${showEditCityModal.id}`, {
        method: 'PUT',
        body: JSON.stringify(editCity),
      });

      toast({
        title: "City updated",
        description: `${editCity.name_en} has been updated successfully.`,
      });

      // Update local state
      setGovernorates(prev => prev.map(gov => ({
        ...gov,
        cities: gov.cities?.map(city => 
          city.id === showEditCityModal.id 
            ? { ...city, name_en: editCity.name_en, name_ar: editCity.name_ar }
            : city
        )
      })));

      setShowEditCityModal(null);
      setEditCity({ name_en: '', name_ar: '' });
    } catch (error: any) {
      console.error('Error updating city:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update city",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteCity = async (cityId: string, governorateId: string, force: boolean = false) => {
    if (!force && !confirm('Are you sure you want to delete this city?')) {
      return;
    }

    setActionLoading(`delete-city-${cityId}`);
    try {
      const response = await makeApiRequest(`${API_URL}/admin/cities/${cityId}${force ? '?force=true' : ''}`, {
        method: 'DELETE',
      });

      toast({
        title: "City deleted",
        description: response.message || "City has been deleted successfully.",
      });

      // Remove from local state
      setGovernorates(prev => prev.map(gov => 
        gov.id === governorateId 
          ? { ...gov, cities: gov.cities?.filter(city => city.id !== cityId) || [] }
          : gov
      ));
    } catch (error: any) {
      console.error('Error deleting city:', error);
      console.error('Error message:', error?.message);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Check if it's a validation error with force option available
      if (error?.message?.includes('Cannot delete') && error?.message?.includes('properties')) {
        const confirmed = confirm(
          `${error.message}\n\nDo you want to FORCE DELETE this city? This will set the properties' city to NULL.`
        );
        if (confirmed) {
          // Retry with force=true
          deleteCity(cityId, governorateId, true);
          return;
        }
      }
      
      toast({
        title: "Error",
        description: error?.message || error?.toString() || "Failed to delete city",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Loading state
  if (loading.auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mx-auto absolute top-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center p-8">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-6">Admin privileges required to access this page.</p>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Toggle governorate expansion
  const toggleGovernorate = (governorateId: string) => {
    const newExpanded = new Set(expandedGovernorates);
    if (newExpanded.has(governorateId)) {
      newExpanded.delete(governorateId);
    } else {
      newExpanded.add(governorateId);
    }
    setExpandedGovernorates(newExpanded);
  };

  // Toggle expand/collapse for properties
  const toggleProperty = (propertyId: string) => {
    const newExpanded = new Set(expandedProperties);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedProperties(newExpanded);
  };

  // Toggle expand/collapse for contacts
  const toggleContact = (contactId: string) => {
    const newExpanded = new Set(expandedContacts);
    if (newExpanded.has(contactId)) {
      newExpanded.delete(contactId);
    } else {
      newExpanded.add(contactId);
    }
    setExpandedContacts(newExpanded);
  };

  // Page counter component
  const PageCounter = ({ tabName, totalItems }: { tabName: keyof typeof currentPage, totalItems: number }) => {
    if (totalItems === 0) return null;
    
    const current = currentPage[tabName];
    const perPage = tabName === 'users' ? usersPerPage : itemsPerPage;
    const totalPages = Math.ceil(totalItems / perPage);
    const startItem = (current - 1) * perPage + 1;
    const endItem = Math.min(current * perPage, totalItems);
    
    return (
      <div className="text-center py-3 text-sm text-gray-600 font-medium bg-gray-50 rounded-lg">
        Showing <span className="font-bold text-blue-600">{startItem}</span> - <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{totalItems}</span> items
        {totalPages > 1 && (
          <> | Page <span className="font-bold text-blue-600">{current}</span> of <span className="font-bold text-blue-600">{totalPages}</span></>
        )}
      </div>
    );
  };

  // Pagination helper component
  const PaginationControls = ({ tabName, totalItems }: { tabName: keyof typeof currentPage, totalItems: number }) => {
    const perPage = tabName === 'users' ? usersPerPage : itemsPerPage;
    const totalPages = Math.ceil(totalItems / perPage);
    const current = currentPage[tabName];
    
    if (totalPages <= 1) return null;

    const maxVisiblePages = 8;
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisiblePages) {
      if (current <= 4) {
        endPage = maxVisiblePages;
      } else if (current >= totalPages - 3) {
        startPage = totalPages - maxVisiblePages + 1;
      } else {
        startPage = current - 3;
        endPage = current + 4;
      }
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    const setPage = (page: number) => {
      setCurrentPage(prev => ({ ...prev, [tabName]: page }));
    };

    return (
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
        {/* First Page */}
        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              className="min-w-[40px]"
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {/* Page Numbers */}
        {pages.map(page => (
          <Button
            key={page}
            variant={current === page ? "default" : "outline"}
            size="sm"
            onClick={() => setPage(page)}
            className="min-w-[40px]"
          >
            {page}
          </Button>
        ))}

        {/* Last Page */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              className="min-w-[40px]"
            >
              {totalPages}
            </Button>
          </>
        )}

        {/* Page Info */}
        <span className="text-sm text-gray-600 ml-4">
          Page {current} of {totalPages}
        </span>
      </div>
    );
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-100">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className={`flex items-center space-x-3 sm:space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{isRTL ? 'لوحة الإدارة' : 'Admin Panel'}</h1>
                <p className="text-red-100 text-sm sm:text-base md:text-lg">{isRTL ? 'لوحة معلومات إدارة النظام' : 'System Management Dashboard'}</p>
              </div>
            </div>

            {/* Badge - Separate line on mobile */}
            <Badge className="bg-white text-red-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold self-start sm:self-auto">
              {isFounder ? (isRTL ? 'المؤسس' : 'Founder') : (isRTL ? 'المسؤول' : 'Administrator')}
            </Badge>
          </div>

          {/* Mobile Stats - Always visible */}
          <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4 md:hidden">
            <div className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold">{stats.pendingProperties}</div>
              <div className="text-red-100 text-xs sm:text-sm mt-1">{isRTL ? 'قيد الانتظار' : 'Pending'}</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-red-100 text-xs sm:text-sm mt-1">{isRTL ? 'المستخدمين' : 'Users'}</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalContacts}</div>
              <div className="text-red-100 text-xs sm:text-sm mt-1">{isRTL ? 'جهات' : 'Contacts'}</div>
            </div>
          </div>

          {/* Desktop Stats & Refresh */}
          <div className={`hidden md:flex items-center space-x-6 mt-6 ${isRTL ? 'space-x-reverse' : ''}`}>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.pendingProperties}</div>
                <div className="text-red-100 text-sm">{isRTL ? 'قيد الانتظار' : 'Pending'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="text-red-100 text-sm">{isRTL ? 'المستخدمين' : 'Users'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalContacts}</div>
                <div className="text-red-100 text-sm">{isRTL ? 'جهات الاتصال' : 'Contacts'}</div>
              </div>
            </div>
            <Button 
              onClick={refreshAllData}
              variant="outline" 
              className={`bg-white/10 border-white/20 text-white hover:bg-white/20 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
          </div>

          {/* Mobile Refresh Button */}
          <div className="mt-4 md:hidden">
            <Button 
              onClick={refreshAllData}
              variant="outline" 
              size="sm"
              className={`w-full bg-white/10 border-white/20 text-white hover:bg-white/20 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'تحديث البيانات' : 'Refresh Data'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 -mt-4 sm:-mt-6 md:-mt-8 relative z-10">
        {error && (
          <div className="mb-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center space-x-2 text-red-800 ${isRTL ? 'space-x-reverse' : ''}`}>
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                  <Button 
                    onClick={() => setError(null)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    {isRTL ? 'إغلاق' : 'Dismiss'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="approvals" className="space-y-4 sm:space-y-6" onValueChange={(value) => {
          // Load locations only when the Locations tab is opened
          if (value === 'locations' && governorates.length === 0 && !loading.locations) {
            loadLocations();
          }
          // Load all properties when Property Management tab is opened
          if (value === 'manage-properties' && allProperties.length === 0 && !loadingAllProperties) {
            loadAllProperties();
          }
        }}>
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="inline-flex w-auto min-w-full lg:grid lg:grid-cols-6 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-lg border-0">
              <TabsTrigger value="approvals" className={`flex items-center space-x-1 sm:space-x-2 whitespace-nowrap px-3 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white ${isRTL ? 'space-x-reverse' : ''}`}>
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{isRTL ? 'الموافقات' : 'Approvals'}</span>
                <span className="sm:hidden">{isRTL ? 'موافقات' : 'Approvals'}</span>
                {stats.pendingProperties > 0 && (
                  <Badge className="bg-red-500 text-white text-[10px] sm:text-xs px-1 py-0 sm:px-1.5 sm:py-0.5 ml-1">{stats.pendingProperties}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="manage-properties" className={`flex items-center space-x-1 sm:space-x-2 whitespace-nowrap px-3 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white ${isRTL ? 'space-x-reverse' : ''}`}>
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden md:inline">{isRTL ? 'إدارة العقارات' : 'Manage Properties'}</span>
                <span className="md:hidden">{isRTL ? 'عقارات' : 'Properties'}</span>
              </TabsTrigger>
              <TabsTrigger value="users" className={`flex items-center space-x-1 sm:space-x-2 whitespace-nowrap px-3 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white ${isRTL ? 'space-x-reverse' : ''}`}>
                <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{isRTL ? 'المستخدمين' : 'Users'}</span>
                <span className="sm:hidden">{isRTL ? 'مستخدمين' : 'Users'}</span>
                <Badge className="bg-gray-500 text-white text-[10px] sm:text-xs px-1 py-0 sm:px-1.5 sm:py-0.5 ml-1">{stats.totalUsers}</Badge>
              </TabsTrigger>
              <TabsTrigger value="chats" className={`flex items-center space-x-1 sm:space-x-2 whitespace-nowrap px-3 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white ${isRTL ? 'space-x-reverse' : ''}`}>
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{isRTL ? 'المحادثات' : 'Chats'}</span>
                <span className="sm:hidden">{isRTL ? 'دردشة' : 'Chats'}</span>
              </TabsTrigger>
              <TabsTrigger value="contacts" className={`flex items-center space-x-1 sm:space-x-2 whitespace-nowrap px-3 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white ${isRTL ? 'space-x-reverse' : ''}`}>
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{isRTL ? 'جهات الاتصال' : 'Contacts'}</span>
                <span className="sm:hidden">{isRTL ? 'جهات' : 'Contacts'}</span>
                <Badge className="bg-gray-500 text-white text-[10px] sm:text-xs px-1 py-0 sm:px-1.5 sm:py-0.5 ml-1">{stats.totalContacts}</Badge>
              </TabsTrigger>
              <TabsTrigger value="locations" className={`flex items-center space-x-1 sm:space-x-2 whitespace-nowrap px-3 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white ${isRTL ? 'space-x-reverse' : ''}`}>
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{isRTL ? 'المواقع' : 'Locations'}</span>
                <span className="sm:hidden">{isRTL ? 'مواقع' : 'Locations'}</span>
                <Badge className="bg-gray-500 text-white text-[10px] sm:text-xs px-1 py-0 sm:px-1.5 sm:py-0.5 ml-1">{stats.totalGovernorates}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Property Approval Requests */}
          <TabsContent value="approvals">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg p-4 sm:p-6">
                <CardTitle className={`flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 ${isRTL ? 'sm:space-x-reverse' : ''}`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-lg sm:text-xl font-semibold">{isRTL ? 'طلبات الموافقة على العقار' : 'Property Approval Requests'}</span>
                  </div>
                  <Badge className="bg-white text-blue-600 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm">{stats.pendingProperties} {isRTL ? 'قيد الانتظار' : 'Pending'}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                {loading.properties ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">{isRTL ? 'جاري تحميل العقارات...' : 'Loading properties...'}</p>
                  </div>
                ) : Array.isArray(properties) && properties.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{isRTL ? 'تم الانتهاء من كل شيء!' : 'All caught up!'}</h3>
                    <p className="text-gray-600">{isRTL ? 'لا توجد موافقات معلقة على العقارات' : 'No pending property approvals'}</p>
                  </div>
                ) : (
                  <>
                    {/* Page Counter - Top */}
                    <PageCounter tabName="approvals" totalItems={properties.length} />
                    
                    <div className="space-y-4 sm:space-y-6">
                      {Array.isArray(properties) && properties
                        .slice((currentPage.approvals - 1) * itemsPerPage, currentPage.approvals * itemsPerPage)
                        .map((property) => {
                          const isExpanded = expandedProperties.has(property.id);
                          return (
                            <div key={property.id} className="border border-gray-200 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 bg-white">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                {/* Property Images */}
                                <div className="space-y-4">
                                  {property.images && Array.isArray(property.images) && property.images.length > 0 ? (
                                    <div className="relative">
                                      <div className="grid grid-cols-2 gap-2">
                                        {property.images.slice(0, 4).map((image, index) => (
                                          <img
                                            key={index}
                                            src={getImageUrl(image)}
                                            alt={`Property ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                            }}
                                          />
                                        ))}
                                      </div>
                                      {property.is_active === false && (
                                        <div className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'}`}>
                                          <Badge className={`bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                                            <Power className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                            {isRTL ? 'غير نشط' : 'Inactive'}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                        <Building className="w-12 h-12 text-gray-400" />
                                      </div>
                                      {property.is_active === false && (
                                        <div className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'}`}>
                                          <Badge className={`bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                                            <Power className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                            {isRTL ? 'غير نشط' : 'Inactive'}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Property Details */}
                                <div className="space-y-2 sm:space-y-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 leading-tight break-words flex-1">{property.title}</h3>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleProperty(property.id)}
                                      className="p-1 sm:p-2 flex-shrink-0"
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                                      )}
                                    </Button>
                                  </div>
                                  
                                  {!isExpanded ? (
                                    <div className="space-y-2">
                                      <p className="text-gray-600 text-sm line-clamp-2 break-words">{property.description}</p>
                                      <div className={`flex items-center space-x-2 text-sm ${isRTL ? 'space-x-reverse' : ''}`}>
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium">{property.location_city}, {property.location_governorate}</span>
                                      </div>
                                      <div className={`flex items-center space-x-2 text-sm ${isRTL ? 'space-x-reverse' : ''}`}>
                                        <DollarSign className="w-4 h-4 text-green-500" />
                                        <span className="font-medium">{Number(property.price).toLocaleString()} {isRTL ? 'جنيه' : 'EGP'}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-gray-600 leading-relaxed break-words whitespace-pre-wrap">{property.description}</p>
                                      
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className={`flex items-center space-x-2 bg-gray-50 p-2 rounded-lg ${isRTL ? 'space-x-reverse' : ''}`}>
                                          <MapPin className="w-4 h-4 text-blue-500" />
                                          <span className="font-medium">{property.location_city}, {property.location_governorate}</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 bg-gray-50 p-2 rounded-lg ${isRTL ? 'space-x-reverse' : ''}`}>
                                          <DollarSign className="w-4 h-4 text-green-500" />
                                          <span className="font-medium">{Number(property.price).toLocaleString()} {isRTL ? 'جنيه' : 'EGP'}</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 bg-gray-50 p-2 rounded-lg ${isRTL ? 'space-x-reverse' : ''}`}>
                                          <Building className="w-4 h-4 text-purple-500" />
                                          <span className="capitalize font-medium">{property.category}</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 bg-gray-50 p-2 rounded-lg ${isRTL ? 'space-x-reverse' : ''}`}>
                                          <Calendar className="w-4 h-4 text-orange-500" />
                                          <span className="font-medium">{new Date(property.created_at).toLocaleDateString()}</span>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <Badge className={`${property.rent_or_buy === 'rent' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'} text-white px-3 py-1`}>
                                          {property.rent_or_buy === 'rent' ? (isRTL ? 'للإيجار' : 'For Rent') : (isRTL ? 'للبيع' : 'For Sale')}
                                        </Badge>
                                        <Badge variant="outline" className="capitalize">
                                          {property.status === 'pending' ? (isRTL ? 'قيد الانتظار' : 'Pending') : 
                                           property.status === 'approved' ? (isRTL ? 'موافق عليه' : 'Approved') : 
                                           property.status === 'rejected' ? (isRTL ? 'مرفوض' : 'Rejected') : property.status}
                                        </Badge>
                                      </div>

                                      {/* Rejection Reason (if rejected) */}
                                      {property.status === 'rejected' && property.rejection_reason && (
                                        <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-lg p-4">
                                          <div className={`flex items-start space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                              <p className="text-red-800 text-sm font-bold mb-1">{isRTL ? 'سبب الرفض:' : 'Rejection Reason:'}</p>
                                              <p className="text-red-700 text-sm leading-relaxed">{property.rejection_reason}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>

                                {/* Seller Info & Actions */}
                                <div className="space-y-3 sm:space-y-4">
                                  {isExpanded && (
                                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 rounded-lg border">
                                      <h4 className={`font-semibold text-sm sm:text-base text-gray-800 mb-2 sm:mb-3 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <Users className={`w-3 h-3 sm:w-4 sm:h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-blue-500 flex-shrink-0`} />
                                        {isRTL ? 'معلومات البائع' : 'Seller Information'}
                                      </h4>
                                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                        <p className="flex items-start break-words"><span className={`font-medium ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`}>{isRTL ? 'الاسم:' : 'Name:'}</span> <span className="flex-1">{property.user?.name || 'N/A'}</span></p>
                                        <p className="flex items-start break-words"><span className={`font-medium ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`}>{isRTL ? 'اسم المستخدم:' : 'Username:'}</span> <span className="flex-1">@{property.user?.username || 'N/A'}</span></p>
                                        <p className="flex items-start break-words"><span className={`font-medium ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`}>{isRTL ? 'رقم العقار:' : 'Property ID:'}</span> <span className="flex-1">#{property.id}</span></p>
                                      </div>
                                    </div>
                                  )}

                                  <div className="space-y-2 sm:space-y-3">
                                    <Button 
                                      onClick={() => approveProperty(property.id)}
                                      disabled={!isExpanded || actionLoading === `approve-${property.id}`}
                                      size="sm"
                                      className={`w-full h-9 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isRTL ? 'flex-row-reverse' : ''}`}
                                    >
                                      {actionLoading === `approve-${property.id}` ? (
                                        <>
                                          <Loader2 className={`w-3 h-3 sm:w-4 sm:h-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin flex-shrink-0`} />
                                          <span className="truncate">{isRTL ? 'جاري الموافقة...' : 'Approving...'}</span>
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`} />
                                          <span className="truncate">{isRTL ? 'الموافقة على العقار' : 'Approve Property'}</span>
                                        </>
                                      )}
                                    </Button>
                                    
                                    <Button 
                                      onClick={() => setShowRejectionModal(property.id)}
                                      disabled={!isExpanded || actionLoading === `reject-${property.id}`}
                                      size="sm"
                                      className={`w-full h-9 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isRTL ? 'flex-row-reverse' : ''}`}
                                    >
                                      <XCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`} />
                                      <span className="truncate">{isRTL ? 'رفض العقار' : 'Reject Property'}</span>
                                    </Button>
                                    
                                    <Button 
                                      variant="outline"
                                      size="sm"
                                      className={`w-full h-9 sm:h-10 text-xs sm:text-sm border-2 border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300 ${isRTL ? 'flex-row-reverse' : ''}`}
                                      onClick={() => navigate(`/property/${property.id}`)}
                                    >
                                      <Eye className={`w-3 h-3 sm:w-4 sm:h-4 ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`} />
                                      <span className="truncate">{isRTL ? 'عرض التفاصيل الكاملة' : 'View Full Details'}</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Page Counter - Bottom */}
                    <PageCounter tabName="approvals" totalItems={properties.length} />

                    {/* Pagination Controls */}
                    <PaginationControls tabName="approvals" totalItems={properties.length} />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Rejection Modal */}
            {showRejectionModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                <Card className="w-full max-w-md shadow-2xl border-0 max-h-[90vh] overflow-auto">
                  <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl font-bold">{isRTL ? 'رفض العقار' : 'Reject Property'}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div>
                      <Label htmlFor="reason" className="text-sm font-semibold text-gray-700">{isRTL ? 'سبب الرفض' : 'Rejection Reason'}</Label>
                      <Textarea
                        id="reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder={isRTL ? 'يرجى تقديم سبب مفصل للرفض...' : 'Please provide a detailed reason for rejection...'}
                        rows={4}
                        className="mt-2 border-2 border-gray-200 focus:border-red-500 rounded-xl"
                      />
                    </div>
                    <div className={`flex space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                      <Button 
                        onClick={() => rejectProperty(showRejectionModal, rejectionReason)}
                        disabled={!rejectionReason.trim() || actionLoading === `reject-${showRejectionModal}`}
                        className={`flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        {actionLoading === `reject-${showRejectionModal}` ? (
                          <>
                            <Loader2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                            {isRTL ? 'جاري الرفض...' : 'Rejecting...'}
                          </>
                        ) : (
                          isRTL ? 'رفض العقار' : 'Reject Property'
                        )}
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowRejectionModal(null);
                          setRejectionReason("");
                        }}
                        variant="outline"
                        className="flex-1 border-2 border-gray-200"
                      >
                        {isRTL ? 'إلغاء' : 'Cancel'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Property Management - All Properties */}
         {/* Property Management - All Properties */}
<TabsContent value="manage-properties">
  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
      <CardTitle className="flex flex-col space-y-3">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
            <div className="p-2 bg-white/20 rounded-lg">
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-xl font-semibold">{isRTL ? 'إدارة العقارات' : 'Property Management'}</span>
            <Badge className="bg-white text-purple-600 px-3 py-1">{allProperties.length} {isRTL ? 'إجمالي' : 'Total'}</Badge>
          </div>
          {filteredByUser && (
            <Button 
              onClick={() => {
                setFilteredByUser(null);
                setPropertyUsernameSearch("");
                loadAllProperties();
              }}
              size="sm"
              variant="outline"
              className="bg-white/20 hover:bg-white/30 border-white/30"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Clear Filter
            </Button>
          )}
        </div>
        
        {/* User Filter Info */}
        {filteredByUser && filteredByUser.user && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Filtered by User:</p>
                <p className="text-lg">@{filteredByUser.username} - {filteredByUser.user.name}</p>
                <p className="text-xs text-white/80">{filteredByUser.user.email}</p>
              </div>
              <Badge className="bg-white text-purple-600 px-3 py-1">
                {allProperties.length} {allProperties.length === 1 ? 'Property' : 'Properties'}
              </Badge>
            </div>
          </div>
        )}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      {/* Username Search Bar */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
          <h3 className={`font-semibold mb-3 text-lg flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Search className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-purple-500`} />
            {isRTL ? 'البحث عن عقارات المستخدم' : 'Search Properties by Username'}
          </h3>
          <div className={`flex space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
            <Input
              placeholder={isRTL ? 'أدخل اسم المستخدم...' : 'Enter username (e.g., john_doe)...'}
              value={propertyUsernameSearch}
              onChange={(e) => setPropertyUsernameSearch(e.target.value)}
              className="flex-1 border-2 border-purple-200 focus:border-purple-500 rounded-xl"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && propertyUsernameSearch.trim()) {
                  loadPropertiesByUsername(propertyUsernameSearch);
                }
              }}
            />
            <Button 
              onClick={() => loadPropertiesByUsername(propertyUsernameSearch)}
              disabled={loadingAllProperties || !propertyUsernameSearch.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {loadingAllProperties ? (
                <Loader2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
              ) : (
                <Search className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              )}
              {isRTL ? 'بحث' : 'Search'}
            </Button>
            {(propertyUsernameSearch || filteredByUser) && (
              <Button 
                onClick={() => {
                  setPropertyUsernameSearch("");
                  setFilteredByUser(null);
                  loadAllProperties();
                }}
                variant="outline"
                className="border-2 border-purple-200 hover:bg-purple-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isRTL ? 'إعادة تعيين' : 'Reset'}
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {isRTL ? 'اكتب اسم المستخدم للعثور على جميع عقاراته' : 'Type a username to find all their properties'}
          </p>
        </div>
      </div>

      {/* Rest of the property management content continues here... */}
                {loadingAllProperties ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-gray-600">{isRTL ? 'جاري تحميل العقارات...' : 'Loading properties...'}</p>
                  </div>
                ) : allProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{isRTL ? 'لم يتم العثور على عقارات' : 'No properties found'}</h3>
                    <p className="text-gray-600">{isRTL ? 'لم يتم تقديم أي عقارات بعد' : 'No properties have been submitted yet'}</p>
                  </div>
                ) : (
                  <>
                    {/* Page Counter - Top */}
                    <PageCounter tabName="propertyManagement" totalItems={allProperties.length} />
                    
                    <div className="space-y-6">
                      {allProperties
                        .slice((currentPage.propertyManagement - 1) * itemsPerPage, currentPage.propertyManagement * itemsPerPage)
                        .map((property) => {
                          const isExpanded = expandedProperties.has(property.id);
                          
                          return (
                            <div key={property.id} className="border border-gray-200 p-6 rounded-xl hover:shadow-lg transition-all duration-300 bg-white">
                              {/* Compact View - Always Show */}
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{property.title}</h3>
                                    <div className={`flex items-center gap-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                      <MapPin className="w-4 h-4" />
                                      <span>{property.location_city || 'N/A'}, {property.location_governorate || 'N/A'}</span>
                                    </div>
                                  </div>
                                  <div className="text-lg font-bold text-green-600 whitespace-nowrap">
                                    ${property.price?.toLocaleString() || 'N/A'}
                                  </div>
                                </div>

                                {/* Status Badges */}
                                <div className="flex gap-2 flex-wrap">
                                  <Badge className={`${
                                    property.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    property.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    property.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {property.status === 'pending' ? (isRTL ? 'قيد الانتظار' : 'Pending') : 
                                     property.status === 'approved' ? (isRTL ? 'موافق عليه' : 'Approved') : 
                                     property.status === 'rejected' ? (isRTL ? 'مرفوض' : 'Rejected') : property.status}
                                  </Badge>
                                  {property.is_active === false && (
                                    <Badge className="bg-gray-600 text-white">
                                      <Power className="w-3 h-3 mr-1" />
                                      Inactive
                                    </Badge>
                                  )}
                                </div>

                                {/* Expand/Collapse Button */}
                                <Button
                                  onClick={() => toggleProperty(property.id)}
                                  variant="outline"
                                  className="w-full"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-4 h-4 mr-2" />
                                      Hide Details
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-4 h-4 mr-2" />
                                      Show Full Details
                                    </>
                                  )}
                                </Button>

                                {/* Expanded View - Conditional */}
                                {isExpanded && (
                                  <div className="space-y-4 pt-4 border-t">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                      {/* Property Images */}
                                      <div className="space-y-4">
                                        {property.images && Array.isArray(property.images) && property.images.length > 0 ? (
                                          <div className="relative">
                                            <div className="grid grid-cols-2 gap-2">
                                              {property.images.slice(0, 4).map((image, index) => (
                                                <img
                                                  key={index}
                                                  src={getImageUrl(image)}
                                                  alt={`Property ${index + 1}`}
                                                  className="w-full h-24 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300"
                                                  onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                  }}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                            <Building className="w-12 h-12 text-gray-400" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Property Details */}
                                      <div className="lg:col-span-2 space-y-3">
                                        <p className="text-gray-600 leading-relaxed break-words whitespace-pre-wrap">{property.description}</p>
                                        
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div className="flex items-center text-gray-700">
                                            <Building className="w-4 h-4 mr-2 text-blue-500" />
                                            <span className="capitalize">{property.category || 'N/A'}</span>
                                          </div>
                                          <div className="flex items-center text-gray-700">
                                            <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                            <span>{new Date(property.created_at).toLocaleDateString()}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 flex-wrap pt-3 border-t">
                                  {/* Only show activate/deactivate for approved properties */}
                                  {property.status === 'approved' && (
                                    <Button 
                                      onClick={() => togglePropertyActive(property.id, property.is_active ?? true)}
                                      disabled={actionLoading === `toggle-${property.id}`}
                                      variant="outline"
                                      className="flex-1"
                                    >
                                      {actionLoading === `toggle-${property.id}` ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : (
                                        <>
                                          <Power className="w-4 h-4 mr-2" />
                                          {property.is_active === false ? 'Activate' : 'Deactivate'}
                                        </>
                                      )}
                                    </Button>
                                  )}

                                  <Button 
                                    onClick={() => deleteProperty(property.id)}
                                    disabled={actionLoading === `delete-${property.id}`}
                                    variant="destructive"
                                    className="flex-1"
                                  >
                                    {actionLoading === `delete-${property.id}` ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </>
                                    )}
                                  </Button>
                                  
                                  <Button 
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => navigate(`/property/${property.id}`)}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    
                    {/* Page Counter - Bottom */}
                    <PageCounter tabName="propertyManagement" totalItems={allProperties.length} />
                    
                    {/* Pagination for Property Management */}
                    <PaginationControls tabName="propertyManagement" totalItems={allProperties.length} />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
      <CardTitle className={`flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 ${isRTL ? 'sm:space-x-reverse' : ''}`}>
        <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
          <div className="p-2 bg-white/20 rounded-lg">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-lg sm:text-xl font-semibold">{isRTL ? 'إدارة المستخدمين' : 'User Management'}</span>
        </div>
        <Badge className="bg-white text-green-600 px-2 py-1 text-xs sm:text-sm">{stats.totalUsers} {isRTL ? 'إجمالي المستخدمين' : 'Total Users'}</Badge>
      </CardTitle>
    </CardHeader>
    <CardContent className="p-3 sm:p-4 md:p-6">
      {loading.users ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">{isRTL ? 'جاري تحميل المستخدمين...' : 'Loading users...'}</p>
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4 md:p-6 rounded-xl border-2 border-green-200">
              <h3 className={`font-semibold mb-3 sm:mb-4 text-sm sm:text-base md:text-lg flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Search className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-green-500 flex-shrink-0`} />
                {isRTL ? 'البحث عن المستخدمين' : 'Search Users'}
              </h3>
              <div className={`flex space-x-2 sm:space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                <Input
                  placeholder={isRTL ? 'ابحث بالاسم، اسم المستخدم، البريد الإلكتروني أو الهاتف...' : 'Search by name, username, email or phone...'}
                  value={userSearchQuery}
                  onChange={(e) => {
                    setUserSearchQuery(e.target.value);
                    setCurrentPage(prev => ({ ...prev, users: 1 }));
                  }}
                  className="flex-1 border-2 border-green-200 focus:border-green-500 rounded-xl h-9 sm:h-10 text-sm sm:text-base"
                />
                {userSearchQuery && (
                  <Button 
                    onClick={() => {
                      setUserSearchQuery("");
                      setCurrentPage(prev => ({ ...prev, users: 1 }));
                    }}
                    variant="outline"
                    size="sm"
                    className={`border-2 border-green-200 hover:bg-green-50 px-2 sm:px-3 h-9 sm:h-10 ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline ml-1">{isRTL ? 'مسح' : 'Clear'}</span>
                  </Button>
                )}
              </div>
              {userSearchQuery && (
                <p className="text-xs sm:text-sm text-green-700 mt-2">
                  {isRTL ? `النتائج: ${filteredUsers.length} من ${stats.totalUsers}` : `Found ${filteredUsers.length} of ${stats.totalUsers} users`}
                </p>
              )}
            </div>
          </div>

          {/* Page Counter - Top */}
          {Array.isArray(filteredUsers) && filteredUsers.length > 0 && (
            <PageCounter tabName="users" totalItems={filteredUsers.length} />
          )}
          
          <div className="space-y-4">
            {Array.isArray(filteredUsers) && filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {userSearchQuery ? (isRTL ? 'لم يتم العثور على مستخدمين' : 'No users found') : (isRTL ? 'لم يتم العثور على مستخدمين' : 'No users found')}
                </h3>
                <p className="text-gray-600">
                  {userSearchQuery 
                    ? (isRTL ? 'حاول البحث بمصطلح آخر' : 'Try searching with different terms')
                    : (isRTL ? 'لا يوجد مستخدمون مسجلون حالياً' : 'No users are currently registered')
                  }
                </p>
              </div>
            ) : (
              Array.isArray(filteredUsers) && filteredUsers
                .slice((currentPage.users - 1) * usersPerPage, currentPage.users * usersPerPage)
                .map((user) => (
              <div key={user.id} className="border border-gray-200 p-3 sm:p-4 rounded-xl hover:shadow-lg transition-all duration-300 bg-white">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-3 lg:space-y-0">
                  <div className="space-y-3 flex-1">
                    <div className={`flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 ${isRTL ? 'sm:space-x-reverse' : ''}`}>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-800 text-base sm:text-lg break-words">{user.name}</h3>
                        <span className="text-gray-500 text-sm">@{user.username}</span>
                      </div>
                      <div className={`flex flex-wrap gap-1.5 sm:gap-2 ${isRTL ? 'sm:space-x-reverse' : ''}`}>
                        {user.is_founder && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg border-2 border-yellow-300 text-xs">
                            👑 {isRTL ? 'المؤسس' : 'Founder'}
                          </Badge>
                        )}
                        {user.is_admin && !user.is_founder && (
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs">{isRTL ? 'مسؤول' : 'Admin'}</Badge>
                        )}
                        {user.is_seller && (
                          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs">Seller</Badge>
                        )}
                        {user.banned && (
                          <Badge className="bg-gradient-to-r from-gray-500 to-slate-500 text-white text-xs">Banned</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                          <span className="truncate">{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                        <span className="truncate">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                      {user.properties_count !== undefined && (
                        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                          <Home className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                          <span className="truncate">{user.properties_count} Properties</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 lg:ml-4">
                    {/* Only show actions if user is not a founder */}
                    {!user.is_founder && (
                      <>
                        {user.banned ? (
                          <Button 
                            onClick={() => unbanUser(user.id)}
                            disabled={actionLoading === `unban-${user.id}`}
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg h-8 sm:h-9 text-xs sm:text-sm"
                          >
                            {actionLoading === `unban-${user.id}` ? (
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                            ) : (
                              <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            )}
                            Unban
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => banUser(user.id)}
                            disabled={
                              actionLoading === `ban-${user.id}` || 
                              (user.is_admin && !isFounder)
                            }
                            size="sm"
                            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg disabled:opacity-50 h-8 sm:h-9 text-xs sm:text-sm"
                            title={
                              (user.is_admin && !isFounder) ? "Only founders can ban admins" : 
                              "Ban this user"
                            }
                          >
                            {actionLoading === `ban-${user.id}` ? (
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                            ) : (
                              <Ban className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            )}
                            Ban
                          </Button>
                        )}
                        
                        <Button 
                          onClick={() => resetUserPassword(user.id)}
                          disabled={actionLoading === `reset-${user.id}`}
                          size="sm"
                          variant="outline"
                          className="border-2 border-gray-200 hover:bg-gray-50 shadow-sm h-8 sm:h-9 text-xs sm:text-sm"
                        >
                          {actionLoading === `reset-${user.id}` ? (
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                          ) : (
                            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          )}
                          <span className="hidden sm:inline">Reset Password</span>
                          <span className="sm:hidden">Reset</span>
                        </Button>
                        
                        {/* Display reset link if generated */}
                        {userResetLinks[user.id] && (
                          <div className="col-span-full mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                            <p className="text-xs font-semibold text-gray-700 mb-2">{isRTL ? 'رابط إعادة تعيين كلمة المرور:' : 'Password Reset Link:'}</p>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={userResetLinks[user.id].resetLink}
                                readOnly
                                className="flex-1 bg-white px-2 py-1 rounded border-2 border-blue-300 font-mono text-xs break-all text-gray-700"
                              />
                              <Button
                                onClick={() => {
                                  navigator.clipboard.writeText(userResetLinks[user.id].resetLink);
                                  toast({
                                    title: "Copied",
                                    description: "Reset link copied to clipboard",
                                  });
                                }}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                              >
                                📋
                              </Button>
                            </div>
                            <p className="text-xs text-blue-600 mt-1">{isRTL ? 'ينتهي في 24 ساعة - للاستخدام مرة واحدة فقط' : 'Expires in 24 hours - One-time use only'}</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Founder-only: Promote to Admin */}
                    {isFounder && !user.is_admin && !user.is_founder && (
                      <Button 
                        onClick={() => promoteToAdmin(user.id, user.name)}
                        disabled={actionLoading === `promote-${user.id}`}
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg h-8 sm:h-9 text-xs sm:text-sm"
                        title="Promote to Admin (Founder only)"
                      >
                        {actionLoading === `promote-${user.id}` ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                        ) : (
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        )}
                        Promote
                      </Button>
                    )}

                    {/* Founder-only: Demote from Admin */}
                    {isFounder && user.is_admin && !user.is_founder && (
                      <Button 
                        onClick={() => demoteToUser(user.id, user.name)}
                        disabled={actionLoading === `demote-${user.id}`}
                        size="sm"
                        className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg h-8 sm:h-9 text-xs sm:text-sm"
                        title="Demote from Admin (Founder only)"
                      >
                        {actionLoading === `demote-${user.id}` ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                        ) : (
                          <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        )}
                        Demote
                      </Button>
                    )}

                    {/* Founder-only: Delete User */}
                    {isFounder && !user.is_founder && (
                      <Button 
                        onClick={() => deleteUser(user.id, user.name)}
                        disabled={actionLoading === `delete-${user.id}`}
                        size="sm"
                        variant="destructive"
                        className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white shadow-lg h-8 sm:h-9 text-xs sm:text-sm"
                        title="Permanently delete this user (Founder only)"
                      >
                        {actionLoading === `delete-${user.id}` ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        )}
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Page Counter - Bottom */}
        {Array.isArray(filteredUsers) && filteredUsers.length > 0 && (
          <PageCounter tabName="users" totalItems={filteredUsers.length} />
        )}
        
        {/* Pagination for Users */}
        <PaginationControls tabName="users" totalItems={filteredUsers.length} />
      </>
    )}
  </CardContent>
</Card>
</TabsContent>
        {/* Chat Management */}
        <TabsContent value="chats">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-semibold">{isRTL ? 'إدارة المحادثات' : 'Chat Management'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Search User Chats */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border">
                    <h3 className={`font-semibold mb-4 text-lg flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Search className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-purple-500`} />
                      {isRTL ? 'البحث في محادثات المستخدم' : 'Search User Chats'}
                    </h3>
                    <div className={`flex space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                      <Input
                        placeholder={isRTL ? 'أدخل اسم المستخدم للبحث في المحادثات...' : 'Enter username to view their chats...'}
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                        className="flex-1 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                        onKeyPress={(e) => e.key === 'Enter' && searchUserChats()}
                      />
                      <Button 
                        onClick={searchUserChats}
                        disabled={loading.chats}
                        className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        {loading.chats ? (
                          <Loader2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                        ) : (
                          <Search className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        )}
                        {isRTL ? 'بحث' : 'Search'}
                      </Button>
                    </div>
                  </div>

                  {/* Chat View - Similar to ChatPanel */}
                  {selectedUser && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border rounded-xl overflow-hidden bg-white">
                      {/* Chat Users List */}
                      <div className="lg:col-span-1 border-r">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                          <h4 className="font-semibold text-lg">
                            @{selectedUser.username}'s Chats
                          </h4>
                          <p className="text-xs text-blue-100">
                            {userChats.length} conversations (including deleted)
                          </p>
                        </div>
                        
                        <div className="divide-y max-h-[500px] overflow-y-auto">
                          {userChats.length === 0 ? (
                            <div className="text-center py-12 px-4">
                              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600 text-sm">No conversations found</p>
                            </div>
                          ) : (
                            userChats.map((chatUser) => (
                              <button
                                key={chatUser.id}
                                onClick={() => loadConversation(chatUser)}
                                className={`w-full p-4 text-left hover:bg-blue-50 transition-all ${
                                  selectedChatUser?.id === chatUser.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                      {chatUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    {chatUser.is_online && (
                                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h5 className="font-semibold text-sm truncate">{chatUser.name}</h5>
                                      {chatUser.is_admin && (
                                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Admin</span>
                                      )}
                                      {chatUser.is_founder && (
                                        <span className="text-xs bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded">Founder</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                      @{chatUser.username} • {chatUser.total_messages} messages
                                    </p>
                                    {chatUser.last_message && (
                                      <p className="text-xs text-gray-400 truncate mt-1">
                                        {chatUser.last_message.message}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Conversation View */}
                      <div className="lg:col-span-2">
                        {selectedChatUser ? (
                          <>
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                              <h4 className="font-semibold">
                                Conversation with @{selectedChatUser.username}
                              </h4>
                              <p className="text-xs text-blue-100">
                                {selectedChatUser.is_online ? 'Online' : selectedChatUser.last_seen_at ? `Last seen ${new Date(selectedChatUser.last_seen_at).toLocaleString()}` : 'Offline'}
                              </p>
                            </div>
                            
                            <div className="p-4 max-h-[500px] overflow-y-auto bg-gray-50">
                              {loadingConversation ? (
                                <div className="text-center py-12">
                                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                                  <p className="text-gray-600 text-sm">Loading messages...</p>
                                </div>
                              ) : conversationMessages.length === 0 ? (
                                <div className="text-center py-12">
                                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-gray-600">No messages</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {conversationMessages.map((msg) => {
                                    const isSentBySearchedUser = msg.sender_id === selectedUser.id;
                                    return (
                                      <div
                                        key={msg.id}
                                        className={`flex ${isSentBySearchedUser ? 'justify-end' : 'justify-start'}`}
                                      >
                                        <div className={`max-w-[70%] ${msg.is_deleted ? 'opacity-50' : ''}`}>
                                          <div className={`rounded-2xl px-4 py-2 ${
                                            isSentBySearchedUser
                                              ? 'bg-blue-500 text-white'
                                              : 'bg-white border text-gray-800'
                                          }`}>
                                            <p className="text-sm">{msg.message}</p>
                                            {msg.is_deleted && (
                                              <p className="text-xs mt-1 opacity-70">🗑️ Deleted</p>
                                            )}
                                          </div>
                                          <div className="flex items-center space-x-2 mt-1 px-1">
                                            <span className="text-xs text-gray-500">
                                              {new Date(msg.created_at).toLocaleTimeString()}
                                            </span>
                                            {msg.is_read && isSentBySearchedUser && (
                                              <span className="text-xs text-blue-500">✓✓</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full min-h-[400px]">
                            <div className="text-center">
                              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <h5 className="font-semibold text-gray-800 mb-2">Select a conversation</h5>
                              <p className="text-gray-600 text-sm">Choose a chat to view messages</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Requests */}
          <TabsContent value="contacts">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Mail className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-semibold">{isRTL ? 'طلبات الاتصال' : 'Contact Requests'}</span>
                  <Badge className="bg-white text-orange-600 px-3 py-1">{stats.totalContacts} {isRTL ? 'إجمالي' : 'Total'}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading.contacts ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-600">{isRTL ? 'جاري تحميل طلبات الاتصال...' : 'Loading contact requests...'}</p>
                  </div>
                ) : (
                  <>
                    {/* Pending Contact Requests */}
                    <div className="mb-8">
                      <h3 className={`text-lg font-semibold text-gray-800 mb-4 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Mail className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-orange-500`} />
                        {isRTL ? 'الطلبات المعلقة' : 'Pending Requests'}
                        <Badge className={`${isRTL ? 'mr-3' : 'ml-3'} bg-orange-100 text-orange-700`}>
                          {Array.isArray(contactRequests) ? contactRequests.filter(r => r.status !== 'resolved' && r.status !== 'closed').length : 0}
                        </Badge>
                      </h3>
                      
                      {/* Page Counter - Top */}
                      {Array.isArray(contactRequests) && contactRequests.filter(r => r.status !== 'resolved' && r.status !== 'closed').length > 0 && (
                        <PageCounter tabName="contacts" totalItems={contactRequests.filter(r => r.status !== 'resolved' && r.status !== 'closed').length} />
                      )}
                      
                      <div className="space-y-4">
                        {Array.isArray(contactRequests) && contactRequests.filter(r => r.status !== 'resolved' && r.status !== 'closed').length === 0 ? (
                          <div className="text-center py-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                            <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{isRTL ? 'تم الانتهاء من كل شيء!' : 'All caught up!'}</h3>
                            <p className="text-gray-600">{isRTL ? 'لا توجد طلبات اتصال معلقة' : 'No pending contact requests'}</p>
                          </div>
                        ) : (
                          Array.isArray(contactRequests) && contactRequests
                            .filter(r => r.status !== 'resolved' && r.status !== 'closed')
                            .slice((currentPage.contacts - 1) * itemsPerPage, currentPage.contacts * itemsPerPage)
                            .map((request) => {
                              const isExpanded = expandedContacts.has(request.id);
                              return (
                                <div key={request.id} className="border border-gray-200 p-6 rounded-xl hover:shadow-lg transition-all duration-300 bg-white">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800 text-lg">{request.name}</h3>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleContact(request.id)}
                                          className="ml-2"
                                        >
                                          {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-orange-500" />
                                          ) : (
                                            <ChevronDown className="w-5 h-5 text-orange-500" />
                                          )}
                                        </Button>
                                      </div>
                                      
                                      {!isExpanded ? (
                                        <div className="text-sm text-gray-600 space-y-2">
                                          <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-blue-500" />
                                            <span className="truncate">{request.email}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-purple-500" />
                                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="text-sm text-gray-600 space-y-2">
                                            <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                                              <Mail className="w-4 h-4 text-blue-500" />
                                              <span className="truncate">{request.email}</span>
                                            </div>
                                            {request.phone && (
                                              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                                                <Phone className="w-4 h-4 text-green-500" />
                                                <span>{request.phone}</span>
                                              </div>
                                            )}
                                            <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                                              <Calendar className="w-4 h-4 text-purple-500" />
                                              <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                            </div>
                                          </div>
                                          {request.property_interest && (
                                            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                              Interested in: {request.property_interest}
                                            </Badge>
                                          )}
                                          {request.status && (
                                            <Badge variant="outline" className="capitalize">
                                              {request.status}
                                            </Badge>
                                          )}
                                        </>
                                      )}
                                    </div>
                                    
                                    {isExpanded && (
                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="font-medium text-gray-800 mb-2">Subject: {request.subject}</h4>
                                          <p className="text-sm text-gray-600 bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border">
                                            {request.message}
                                          </p>
                                        </div>
                                        <div className="flex space-x-3">
                                          <Button 
                                            onClick={() => markContactResolved(request.id)}
                                            disabled={actionLoading === `resolve-${request.id}`}
                                            size="sm" 
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex-1"
                                          >
                                            {actionLoading === `resolve-${request.id}` ? (
                                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                            ) : (
                                              <CheckCircle className="w-4 h-4 mr-1" />
                                            )}
                                            Mark Resolved
                                          </Button>
                                          <Button 
                                            onClick={() => deleteContact(request.id)}
                                            disabled={actionLoading === `delete-${request.id}`}
                                            size="sm" 
                                            variant="outline"
                                            className="border-2 border-red-200 text-red-600 hover:bg-red-50 flex-1"
                                          >
                                            {actionLoading === `delete-${request.id}` ? (
                                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                            ) : (
                                              <Trash2 className="w-4 h-4 mr-1" />
                                            )}
                                            Delete
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                      
                      {/* Page Counter - Bottom */}
                      {Array.isArray(contactRequests) && contactRequests.filter(r => r.status !== 'resolved' && r.status !== 'closed').length > 0 && (
                        <>
                          <PageCounter tabName="contacts" totalItems={contactRequests.filter(r => r.status !== 'resolved' && r.status !== 'closed').length} />
                          <PaginationControls tabName="contacts" totalItems={contactRequests.filter(r => r.status !== 'resolved' && r.status !== 'closed').length} />
                        </>
                      )}
                    </div>

                    {/* Resolved Contact Requests History */}
                    <div className="border-t-2 border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                        Resolved Requests History
                        <Badge className="ml-3 bg-green-100 text-green-700">
                          {Array.isArray(contactRequests) ? contactRequests.filter(r => r.status === 'resolved' || r.status === 'closed').length : 0}
                        </Badge>
                      </h3>
                      
                      {/* Page Counter - Top */}
                      {Array.isArray(contactRequests) && contactRequests.filter(r => r.status === 'resolved' || r.status === 'closed').length > 0 && (
                        <PageCounter tabName="contactHistory" totalItems={contactRequests.filter(r => r.status === 'resolved' || r.status === 'closed').length} />
                      )}
                      
                      <div className="space-y-4">
                        {Array.isArray(contactRequests) && contactRequests.filter(r => r.status === 'resolved' || r.status === 'closed').length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-xl">
                            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No resolved contacts yet</p>
                          </div>
                        ) : (
                          Array.isArray(contactRequests) && contactRequests
                            .filter(r => r.status === 'resolved' || r.status === 'closed')
                            .slice((currentPage.contactHistory - 1) * itemsPerPage, currentPage.contactHistory * itemsPerPage)
                            .map((request) => {
                              const isExpanded = expandedContacts.has(request.id);
                              return (
                                <div key={request.id} className="border border-green-200 bg-green-50/30 p-6 rounded-xl hover:shadow-lg transition-all duration-300">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                          <h3 className="font-semibold text-gray-800 text-lg">{request.name}</h3>
                                          <Badge className="bg-green-500 text-white text-xs">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Resolved
                                          </Badge>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleContact(request.id)}
                                          className="ml-2"
                                        >
                                          {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-green-500" />
                                          ) : (
                                            <ChevronDown className="w-5 h-5 text-green-500" />
                                          )}
                                        </Button>
                                      </div>
                                      
                                      {!isExpanded ? (
                                        <div className="text-sm text-gray-600 space-y-2">
                                          <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-blue-500" />
                                            <span className="truncate">{request.email}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-purple-500" />
                                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="text-sm text-gray-600 space-y-2">
                                            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg">
                                              <Mail className="w-4 h-4 text-blue-500" />
                                              <span className="truncate">{request.email}</span>
                                            </div>
                                            {request.phone && (
                                              <div className="flex items-center space-x-2 bg-white p-2 rounded-lg">
                                                <Phone className="w-4 h-4 text-green-500" />
                                                <span>{request.phone}</span>
                                              </div>
                                            )}
                                            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg">
                                              <Calendar className="w-4 h-4 text-purple-500" />
                                              <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                            </div>
                                          </div>
                                          {request.property_interest && (
                                            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                              Interested in: {request.property_interest}
                                            </Badge>
                                          )}
                                        </>
                                      )}
                                    </div>
                                    
                                    {isExpanded && (
                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="font-medium text-gray-800 mb-2">Subject: {request.subject}</h4>
                                          <p className="text-sm text-gray-600 bg-white p-4 rounded-xl border">
                                            {request.message}
                                          </p>
                                        </div>
                                        <div className="flex space-x-3">
                                          <Button 
                                            onClick={() => deleteContact(request.id)}
                                            disabled={actionLoading === `delete-${request.id}`}
                                            size="sm" 
                                            variant="outline"
                                            className="border-2 border-red-200 text-red-600 hover:bg-red-50 flex-1"
                                          >
                                            {actionLoading === `delete-${request.id}` ? (
                                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                            ) : (
                                              <Trash2 className="w-4 h-4 mr-1" />
                                            )}
                                            Delete from History
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                      
                      {/* Page Counter - Bottom */}
                      {Array.isArray(contactRequests) && contactRequests.filter(r => r.status === 'resolved' || r.status === 'closed').length > 0 && (
                        <>
                          <PageCounter tabName="contactHistory" totalItems={contactRequests.filter(r => r.status === 'resolved' || r.status === 'closed').length} />
                          <PaginationControls tabName="contactHistory" totalItems={contactRequests.filter(r => r.status === 'resolved' || r.status === 'closed').length} />
                        </>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locations Management */}
          <TabsContent value="locations">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className={`flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 ${isRTL ? 'sm:space-x-reverse' : ''}`}>
                    <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                      <div className="p-2 bg-white/20 rounded-lg">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-lg sm:text-xl font-semibold">{isRTL ? 'إدارة المواقع' : 'Location Management'}</span>
                    </div>
                    <Badge className="bg-white text-indigo-600 px-2 py-1 text-xs sm:text-sm w-fit">
                      {stats.totalGovernorates} {isRTL ? 'محافظة' : 'Gov'} • {stats.totalCities} {isRTL ? 'مدينة' : 'Cities'}
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => setShowAddGovernorateModal(true)}
                    className={`bg-white/20 hover:bg-white/30 border-white/30 h-8 sm:h-9 text-xs sm:text-sm ${isRTL ? 'flex-row-reverse' : ''} w-full sm:w-auto`}
                    size="sm"
                  >
                    <Plus className={`w-3 h-3 sm:w-4 sm:h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className="hidden sm:inline">{isRTL ? 'إضافة محافظة' : 'Add Governorate'}</span>
                    <span className="sm:hidden">{isRTL ? 'إضافة' : 'Add'}</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                {loading.locations ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
                    <p className="text-gray-600">{isRTL ? 'جاري تحميل المواقع...' : 'Loading locations...'}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Array.isArray(governorates) && governorates.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                          <MapPin className="w-12 h-12 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{isRTL ? 'لم يتم العثور على مواقع' : 'No locations found'}</h3>
                        <p className="text-gray-600 mb-4">{isRTL ? 'ابدأ بإضافة محافظتك الأولى' : 'Start by adding your first governorate'}</p>
                        <Button 
                          onClick={() => setShowAddGovernorateModal(true)}
                          className={`bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white ${isRTL ? 'flex-row-reverse' : ''}`}
                        >
                          <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {isRTL ? 'إضافة المحافظة الأولى' : 'Add First Governorate'}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4 sm:gap-6">
                          {Array.isArray(governorates) && governorates
                            .slice((currentPage.locations - 1) * itemsPerPage, currentPage.locations * itemsPerPage)
                            .map((governorate) => {
                            const isExpanded = expandedGovernorates.has(governorate.id);
                            return (
                              <div key={governorate.id} className="border border-gray-200 rounded-xl bg-white hover:shadow-lg transition-all duration-300">
                                <div className="p-3 sm:p-4 md:p-6">
                                  <div className="flex flex-col space-y-3">
                                    <div 
                                      className="flex items-center space-x-2 sm:space-x-3 flex-1 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
                                      onClick={() => toggleGovernorate(governorate.id)}
                                    >
                                      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                                        <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg truncate">{governorate.name_en}</h3>
                                        <p className="text-gray-600 text-xs sm:text-sm truncate">{governorate.name_ar}</p>
                                      </div>
                                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-2 py-0.5">
                                          {governorate.cities?.length || 0}
                                        </Badge>
                                        {isExpanded ? (
                                          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      <Button 
                                        onClick={() => {
                                          setShowEditGovernorateModal(governorate);
                                          setEditGovernorate({ name_en: governorate.name_en, name_ar: governorate.name_ar });
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="hover:bg-blue-50 hover:border-blue-300 h-8 text-xs sm:text-sm flex-1 sm:flex-initial"
                                      >
                                        <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        Edit
                                      </Button>
                                      <Button 
                                        onClick={() => deleteGovernorate(governorate.id)}
                                        disabled={actionLoading === `delete-gov-${governorate.id}`}
                                        size="sm"
                                        variant="outline"
                                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 h-8 text-xs sm:text-sm flex-1 sm:flex-initial"
                                      >
                                        {actionLoading === `delete-gov-${governorate.id}` ? (
                                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                        ) : (
                                          <>
                                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                            <span className="hidden sm:inline">Delete</span>
                                            <span className="sm:hidden">Del</span>
                                          </>
                                        )}
                                      </Button>
                                      <Button 
                                        onClick={() => setShowAddCityModal(governorate.id)}
                                        size="sm"
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-8 text-xs sm:text-sm flex-1 sm:flex-initial"
                                      >
                                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                        <span className="hidden sm:inline">Add City</span>
                                        <span className="sm:hidden">City</span>
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Cities Grid - Collapsible */}
                                  {isExpanded && (
                                    <div className="mt-3 sm:mt-4">
                                      {governorate.cities && governorate.cities.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                                          {governorate.cities.map((city) => (
                                      <div key={city.id} className="bg-gradient-to-br from-gray-50 to-blue-50 p-2 sm:p-3 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300">
                                        <div className="text-xs sm:text-sm mb-2">
                                          <p className="font-medium text-gray-800 truncate">{city.name_en}</p>
                                          <p className="text-gray-600 text-xs truncate">{city.name_ar}</p>
                                        </div>
                                        <div className="flex gap-1">
                                          <Button
                                            onClick={() => {
                                              setShowEditCityModal(city);
                                              setEditCity({ name_en: city.name_en, name_ar: city.name_ar });
                                            }}
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 text-xs h-7 hover:bg-blue-50"
                                          >
                                            <Edit3 className="w-3 h-3" />
                                            <span className="ml-1 hidden sm:inline">Edit</span>
                                          </Button>
                                          <Button
                                            onClick={() => deleteCity(city.id, governorate.id)}
                                            disabled={actionLoading === `delete-city-${city.id}`}
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 text-xs h-7 hover:bg-red-50 hover:text-red-600"
                                          >
                                            {actionLoading === `delete-city-${city.id}` ? (
                                              <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <>
                                                <Trash2 className="w-3 h-3" />
                                                <span className="ml-1 hidden sm:inline">Del</span>
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <Building className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">No cities added yet</p>
                                    <Button 
                                      onClick={() => setShowAddCityModal(governorate.id)}
                                      size="sm"
                                      variant="outline"
                                      className="border-2 border-gray-300 h-8 text-xs sm:text-sm"
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add First City
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Pagination for Locations */}
                  <PaginationControls tabName="locations" totalItems={governorates.length} />
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
        </Tabs>

        {/* Add Governorate Modal */}
        {showAddGovernorateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <Card className="w-full max-w-md shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">Add New Governorate</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="gov_name_en" className="text-sm font-semibold text-gray-700">English Name</Label>
                  <Input
                    id="gov_name_en"
                    value={newGovernorate.name_en}
                    onChange={(e) => setNewGovernorate(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder="e.g., Cairo"
                    className="mt-2 border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="gov_name_ar" className="text-sm font-semibold text-gray-700">Arabic Name</Label>
                  <Input
                    id="gov_name_ar"
                    value={newGovernorate.name_ar}
                    onChange={(e) => setNewGovernorate(prev => ({ ...prev, name_ar: e.target.value }))}
                    placeholder="e.g., القاهرة"
                    className="mt-2 border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                    dir="rtl"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={addGovernorate}
                    disabled={!newGovernorate.name_en.trim() || !newGovernorate.name_ar.trim() || actionLoading === 'add-governorate'}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {actionLoading === 'add-governorate' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Governorate
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowAddGovernorateModal(false);
                      setNewGovernorate({ name_en: '', name_ar: '' });
                    }}
                    variant="outline"
                    className="flex-1 border-2 border-gray-200"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add City Modal */}
        {showAddCityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <Card className="w-full max-w-md shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">Add New City</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="city_name_en" className="text-sm font-semibold text-gray-700">English Name</Label>
                  <Input
                    id="city_name_en"
                    value={newCity.name_en}
                    onChange={(e) => setNewCity(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder="e.g., Nasr City"
                    className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="city_name_ar" className="text-sm font-semibold text-gray-700">Arabic Name</Label>
                  <Input
                    id="city_name_ar"
                    value={newCity.name_ar}
                    onChange={(e) => setNewCity(prev => ({ ...prev, name_ar: e.target.value }))}
                    placeholder="e.g., مدينة نصر"
                    className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                    dir="rtl"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={() => addCity(showAddCityModal)}
                    disabled={!newCity.name_en.trim() || !newCity.name_ar.trim() || actionLoading === `add-city-${showAddCityModal}`}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {actionLoading === `add-city-${showAddCityModal}` ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add City
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowAddCityModal(null);
                      setNewCity({ name_en: '', name_ar: '' });
                    }}
                    variant="outline"
                    className="flex-1 border-2 border-gray-200"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Governorate Modal */}
        {showEditGovernorateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <Card className="w-full max-w-md shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">Edit Governorate</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="edit_gov_name_en" className="text-sm font-semibold text-gray-700">English Name</Label>
                  <Input
                    id="edit_gov_name_en"
                    value={editGovernorate.name_en}
                    onChange={(e) => setEditGovernorate(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder="e.g., Cairo"
                    className="mt-2 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_gov_name_ar" className="text-sm font-semibold text-gray-700">Arabic Name</Label>
                  <Input
                    id="edit_gov_name_ar"
                    value={editGovernorate.name_ar}
                    onChange={(e) => setEditGovernorate(prev => ({ ...prev, name_ar: e.target.value }))}
                    placeholder="e.g., القاهرة"
                    className="mt-2 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                    dir="rtl"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={updateGovernorate}
                    disabled={!editGovernorate.name_en.trim() || !editGovernorate.name_ar.trim() || actionLoading === `edit-gov-${showEditGovernorateModal.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {actionLoading === `edit-gov-${showEditGovernorateModal.id}` ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Update
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowEditGovernorateModal(null);
                      setEditGovernorate({ name_en: '', name_ar: '' });
                    }}
                    variant="outline"
                    className="flex-1 border-2 border-gray-200"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit City Modal */}
        {showEditCityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <Card className="w-full max-w-md shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">Edit City</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="edit_city_name_en" className="text-sm font-semibold text-gray-700">English Name</Label>
                  <Input
                    id="edit_city_name_en"
                    value={editCity.name_en}
                    onChange={(e) => setEditCity(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder="e.g., Nasr City"
                    className="mt-2 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_city_name_ar" className="text-sm font-semibold text-gray-700">Arabic Name</Label>
                  <Input
                    id="edit_city_name_ar"
                    value={editCity.name_ar}
                    onChange={(e) => setEditCity(prev => ({ ...prev, name_ar: e.target.value }))}
                    placeholder="e.g., مدينة نصر"
                    className="mt-2 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                    dir="rtl"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={updateCity}
                    disabled={!editCity.name_en.trim() || !editCity.name_ar.trim() || actionLoading === `edit-city-${showEditCityModal.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {actionLoading === `edit-city-${showEditCityModal.id}` ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Update
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowEditCityModal(null);
                      setEditCity({ name_en: '', name_ar: '' });
                    }}
                    variant="outline"
                    className="flex-1 border-2 border-gray-200"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
