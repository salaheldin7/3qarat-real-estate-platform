import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, CloudUpload, Home, MapPin, Trash2, Info, Loader2, Image as ImageIcon, DollarSign, ArrowRight, AlertCircle, X } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import { API_URL } from '@/config/api';

interface PropertyForm {
  title: string;
  description: string;
  price: string;
  location_governorate: string;
  location_city: string;
  category: string;
  rent_or_buy: string;
  bedrooms?: string;
  bathrooms?: string;
  area?: string;
  images: File[];
}

interface Location {
  id: number | string;
  name_en: string;
  name_ar: string;
}

interface Governorate extends Location {
  cities?: City[];
}

interface City extends Location {
  governorate_id: number | string;
}

interface ExistingImage {
  id: number;
  url: string;
}

const AddProperty = () => {
  const [searchParams] = useSearchParams();
  const editPropertyId = searchParams.get('edit');
  const isEditMode = !!editPropertyId;
  const isInitialLoadRef = useRef(true);

  const [form, setForm] = useState<PropertyForm>({
    title: "",
    description: "",
    price: "",
    location_governorate: "",
    location_city: "",
    category: "",
    rent_or_buy: "buy",
    bedrooms: "",
    bathrooms: "",
    area: "",
    images: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof PropertyForm, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isRTL } = useLanguage();

  // Mock governorates and cities data
  const mockGovernorates: Governorate[] = [
    {
      id: '1',
      name_en: 'Cairo',
      name_ar: 'القاهرة',
      cities: [
        { id: '1-1', name_en: 'New Cairo', name_ar: 'القاهرة الجديدة', governorate_id: '1' },
        { id: '1-2', name_en: 'Nasr City', name_ar: 'مدينة نصر', governorate_id: '1' },
        { id: '1-3', name_en: 'Maadi', name_ar: 'المعادي', governorate_id: '1' },
        { id: '1-4', name_en: 'Heliopolis', name_ar: 'مصر الجديدة', governorate_id: '1' }
      ]
    },
    {
      id: '2',
      name_en: 'Alexandria',
      name_ar: 'الإسكندرية',
      cities: [
        { id: '2-1', name_en: 'Sidi Gaber', name_ar: 'سيدي جابر', governorate_id: '2' },
        { id: '2-2', name_en: 'Montazah', name_ar: 'المنتزه', governorate_id: '2' },
        { id: '2-3', name_en: 'Miami', name_ar: 'ميامي', governorate_id: '2' },
        { id: '2-4', name_en: 'Stanley', name_ar: 'ستانلي', governorate_id: '2' }
      ]
    },
    {
      id: '3',
      name_en: 'Giza',
      name_ar: 'الجيزة',
      cities: [
        { id: '3-1', name_en: '6th October', name_ar: '6 أكتوبر', governorate_id: '3' },
        { id: '3-2', name_en: 'Sheikh Zayed', name_ar: 'الشيخ زايد', governorate_id: '3' },
        { id: '3-3', name_en: 'Dokki', name_ar: 'الدقي', governorate_id: '3' },
        { id: '3-4', name_en: 'Mohandessin', name_ar: 'المهندسين', governorate_id: '3' }
      ]
    }
  ];

  // Cleanup image preview URLs on unmount only
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error('Error revoking URL:', e);
        }
      });
    };
  }, []);

  // Load governorates and cities
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const govResponse = await fetch(`${API_URL}/governorates`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        });

        if (govResponse.ok) {
          const govData = await govResponse.json();
          
          if (govData.success && govData.data) {
            setGovernorates(govData.data);
          } else {
            setGovernorates(mockGovernorates);
          }
        } else {
          setGovernorates(mockGovernorates);
          const allCities = mockGovernorates.flatMap(gov => gov.cities || []);
          setCities(allCities);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
        setGovernorates(mockGovernorates);
        const allCities = mockGovernorates.flatMap(gov => gov.cities || []);
        setCities(allCities);
      }
    };
    
    loadLocations();
  }, []);

  // Load property data when in edit mode
  useEffect(() => {
    const loadPropertyData = async () => {
      if (!isEditMode || !editPropertyId) return;

      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/properties/${editPropertyId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load property');
        }

        const data = await response.json();
        const property = data.success ? data.data : data;

        setForm({
          title: property.title || "",
          description: property.description || "",
          price: property.price?.toString() || "",
          location_governorate: property.governorate_id?.toString() || property.governorate?.id?.toString() || "",
          location_city: property.city_id?.toString() || property.city?.id?.toString() || "",
          category: property.category || "",
          rent_or_buy: property.rent_or_buy || "buy",
          bedrooms: property.bedrooms?.toString() || "",
          bathrooms: property.bathrooms?.toString() || "",
          area: property.area?.toString() || "",
          images: [],
        });

        // Load existing images properly
        if (property.images && Array.isArray(property.images) && property.images.length > 0) {
          console.log('Loading existing images:', property.images);
          // Convert images array to proper format with IDs
          const imagesWithIds = property.images.map((img: any, index: number) => {
            if (typeof img === 'string') {
              // If it's just a URL string, create a temporary ID
              return { id: -(index + 1), url: img }; // Negative IDs for local tracking
            } else if (img.id && img.url) {
              // If it's an object with id and url
              return { id: img.id, url: img.url };
            } else if (img.image_path) {
              // If using image_path field
              return { id: img.id || -(index + 1), url: img.image_path };
            }
            return null;
          }).filter(Boolean);
          
          setExistingImages(imagesWithIds);
        } else {
          setExistingImages([]);
        }

      } catch (error) {
        console.error('Error loading property:', error);
        toast({
          title: isRTL ? "خطأ" : "Error",
          description: isRTL ? "فشل في تحميل بيانات العقار" : "Failed to load property data",
          variant: "destructive",
        });
        navigate('/my-ads');
      } finally {
        setLoading(false);
      }
    };

    loadPropertyData();
  }, [isEditMode, editPropertyId, navigate, toast, isRTL]);

  // Update cities when governorate changes
  useEffect(() => {
    const loadCities = async () => {
      if (form.location_governorate) {
        try {
          const response = await fetch(`${API_URL}/governorates/${form.location_governorate}/cities`, {
            method: "GET",
            headers: {
              "Accept": "application/json",
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setCities(data.data);
            } else {
              setCities([]);
            }
          } else {
            const selectedGovernorate = governorates.find(g => String(g.id) === form.location_governorate);
            if (selectedGovernorate && selectedGovernorate.cities) {
              setCities(selectedGovernorate.cities);
            } else {
              setCities([]);
            }
          }
        } catch (error) {
          console.error("Failed to fetch cities:", error);
          setCities([]);
        }
        
        if (!isEditMode || !isInitialLoadRef.current) {
          setForm(prev => ({...prev, location_city: ""}));
        } else {
          isInitialLoadRef.current = false;
        }
      } else {
        setCities([]);
      }
    };
    
    loadCities();
  }, [form.location_governorate, governorates, isEditMode]);

  const handleChange = (name: keyof PropertyForm, value: string) => {
    setForm(prev => ({...prev, [name]: value}));
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: undefined}));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Validate file types
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const invalidFiles = filesArray.filter(file => !validTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        toast({
          title: isRTL ? "نوع ملف غير صالح" : "Invalid file type",
          description: isRTL 
            ? "يرجى تحميل صور فقط (JPG, PNG, GIF, WebP)"
            : "Please upload images only (JPG, PNG, GIF, WebP)",
          variant: "destructive"
        });
        return;
      }

      // Validate file sizes (max 5MB per file)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = filesArray.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        toast({
          title: isRTL ? "حجم الملف كبير جداً" : "File size too large",
          description: isRTL 
            ? "الحد الأقصى لحجم الصورة هو 5 ميجابايت"
            : "Maximum image size is 5MB",
          variant: "destructive"
        });
        return;
      }
      
      const totalImages = existingImages.length + form.images.length + filesArray.length;
      if (totalImages > 5) {
        const remaining = 5 - existingImages.length - form.images.length;
        toast({
          title: isRTL ? "الحد الأقصى للصور هو 5" : "Maximum 5 images allowed",
          description: isRTL 
            ? `لديك ${existingImages.length + form.images.length} صور بالفعل. يمكنك إضافة ${remaining} فقط.`
            : `You already have ${existingImages.length + form.images.length} images. You can add ${remaining} more.`,
          variant: "destructive"
        });
        return;
      }
      
      // Create preview URLs for new images
      const newImagePreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      
      console.log('Adding new images:', {
        newCount: filesArray.length,
        existingPreviewsCount: imagePreviewUrls.length,
        existingImagesCount: existingImages.length
      });
      
      setImagePreviewUrls(prev => [...prev, ...newImagePreviewUrls]);
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...filesArray]
      }));
      
      if (errors.images) {
        setErrors(prev => ({...prev, images: undefined}));
      }

      // Reset the file input to allow selecting the same file again
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    console.log('Removing new image at index:', index);
    
    const newImages = [...form.images];
    newImages.splice(index, 1);
    
    const newImagePreviewUrls = [...imagePreviewUrls];
    try {
      URL.revokeObjectURL(newImagePreviewUrls[index]);
    } catch (e) {
      console.error('Error revoking URL:', e);
    }
    newImagePreviewUrls.splice(index, 1);
    
    setForm(prev => ({...prev, images: newImages}));
    setImagePreviewUrls(newImagePreviewUrls);

    console.log('After removal:', {
      newImagesCount: newImages.length,
      previewUrlsCount: newImagePreviewUrls.length
    });
  };

  const removeExistingImage = (index: number) => {
    console.log('Removing existing image at index:', index);
    
    const newExistingImages = [...existingImages];
    const removedImage = newExistingImages.splice(index, 1)[0];
    setExistingImages(newExistingImages);

    console.log('Removed existing image:', removedImage.url);
    console.log('Remaining existing images:', newExistingImages.length);
    
    toast({
      title: isRTL ? "تم حذف الصورة" : "Image removed",
      description: isRTL 
        ? "سيتم حذف الصورة عند حفظ التعديلات"
        : "Image will be deleted when you save changes",
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PropertyForm, string>> = {};
    
    if (!form.title.trim()) {
      newErrors.title = isRTL ? "يرجى إدخال عنوان العقار" : "Please enter a property title";
    } else if (form.title.trim().length < 5) {
      newErrors.title = isRTL ? "العنوان قصير جداً (5 أحرف على الأقل)" : "Title too short (minimum 5 characters)";
    }
    
    if (!form.description.trim()) {
      newErrors.description = isRTL ? "يرجى إدخال وصف العقار" : "Please enter a property description";
    } else if (form.description.trim().length < 20) {
      newErrors.description = isRTL ? "الوصف قصير جداً (20 حرف على الأقل)" : "Description too short (minimum 20 characters)";
    }
    
    if (!form.price.trim()) {
      newErrors.price = isRTL ? "يرجى إدخال سعر العقار" : "Please enter a property price";
    } else if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      newErrors.price = isRTL ? "يرجى إدخال سعر صالح" : "Please enter a valid price";
    }
    
    if (!form.location_governorate) {
      newErrors.location_governorate = isRTL ? "يرجى اختيار المحافظة" : "Please select a governorate";
    }
    
    if (!form.location_city) {
      newErrors.location_city = isRTL ? "يرجى اختيار المدينة" : "Please select a city";
    }
    
    if (!form.category) {
      newErrors.category = isRTL ? "يرجى اختيار نوع العقار" : "Please select a property type";
    }
    
    if (!form.rent_or_buy) {
      newErrors.rent_or_buy = isRTL ? "يرجى اختيار نوع العرض" : "Please select listing type";
    }
    
    if (form.images.length === 0 && existingImages.length === 0) {
      newErrors.images = isRTL ? "يرجى تحميل صورة واحدة على الأقل" : "Please upload at least one image";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0] as keyof PropertyForm;
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      toast({
        title: isRTL ? "خطأ في النموذج" : "Form Error",
        description: isRTL ? "يرجى تصحيح الأخطاء في النموذج" : "Please correct the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    setServerError(null);

    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast({
        title: isRTL ? "غير مصرح" : "Unauthorized",
        description: isRTL ? "يرجى تسجيل الدخول أولاً" : "Please login first",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    try {
      const formData = new FormData();
      
      // Add basic fields
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("price", form.price);
      formData.append("governorate_id", form.location_governorate);
      formData.append("city_id", form.location_city);
      formData.append("category", form.category);
      formData.append("rent_or_buy", form.rent_or_buy);

      // Add default amenities
      formData.append("furnished", "0");
      formData.append("has_parking", "0");
      formData.append("has_garden", "0");
      formData.append("has_pool", "0");
      formData.append("has_elevator", "0");

      // Add optional fields
      if (form.bedrooms && Number(form.bedrooms) > 0) {
        formData.append("bedrooms", form.bedrooms);
      }
      if (form.bathrooms && Number(form.bathrooms) > 0) {
        formData.append("bathrooms", form.bathrooms);
      }
      if (form.area && Number(form.area) > 0) {
        formData.append("area", form.area);
      }

      // Handle images for edit mode
      if (isEditMode) {
        // Send current existing image URLs that should be kept
        const remainingImageUrls = existingImages.map(img => img.url);
        if (remainingImageUrls.length > 0) {
          formData.append('existing_images', JSON.stringify(remainingImageUrls));
          console.log('Images to keep:', remainingImageUrls);
        }

        // Add new images if any (these will be added alongside existing ones)
        if (form.images && form.images.length > 0) {
          form.images.forEach((image) => {
            formData.append("images[]", image);
          });
          console.log('New images to upload:', form.images.length);
        }
      } else {
        // For create mode, add all images
        if (form.images && form.images.length > 0) {
          form.images.forEach((image) => {
            formData.append("images[]", image);
          });
        }
      }

      // Log form data for debugging
      console.log(`${isEditMode ? 'Updating' : 'Creating'} property:`);
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0], `File: ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)`);
        } else {
          console.log(pair[0], pair[1]);
        }
      }

      // Different approach for edit vs create
      let response;
      
      if (isEditMode) {
        // For edit: Always use FormData with POST method spoofing
        // This handles both data updates and image changes in one request
        formData.append('_method', 'PUT');
        
        response = await fetch(`${API_URL}/properties/${editPropertyId}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
          body: formData
        });
      } else {
        // For create: Use POST with FormData
        response = await fetch(`${API_URL}/properties`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
          body: formData
        });
      }

      // Handle response
      const contentType = response.headers.get('content-type');
      let data: any = {};
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Non-JSON response
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server error (${response.status}). Please check server logs.`);
      }

      if (!response.ok) {
        // Handle validation errors
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]: [string, any]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${messageArray.join(', ')}`;
            })
            .join('\n');
          throw new Error(isRTL ? `فشل التحقق:\n${errorMessages}` : `Validation failed:\n${errorMessages}`);
        }
        throw new Error(data.message || (isRTL ? "فشل في إرسال العقار" : "Failed to submit property"));
      }

      // Success - show appropriate message
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdminOrFounder = user.is_admin || user.role === 'admin' || user.role === 'founder';

      let successMessage = "";
      let descriptionMessage = "";

      if (isEditMode) {
        if (data.data?.status === 'pending' && data.data?.needs_reapproval) {
          successMessage = isRTL ? "تم إعادة تقديم العقار للمراجعة" : "Property resubmitted for approval";
          descriptionMessage = isRTL 
            ? "تم حفظ التعديلات وإعادة إرسال العقار للمراجعة من قبل المشرفين" 
            : "Your changes have been saved and the property has been resubmitted for admin approval";
        } else {
          successMessage = isRTL ? "✅ تم تحديث العقار بنجاح" : "✅ Property updated successfully";
          descriptionMessage = isRTL ? "تم حفظ التغييرات" : "Your changes have been saved";
        }
      } else {
        if (isAdminOrFounder) {
          successMessage = isRTL ? "✅ تم إضافة العقار بنجاح" : "✅ Property added successfully";
          descriptionMessage = isRTL 
            ? "تم نشر العقار مباشرة في السوق" 
            : "Your property has been published directly to the marketplace";
        } else {
          successMessage = isRTL ? "✅ تم إرسال العقار بنجاح" : "✅ Property submitted successfully";
          descriptionMessage = isRTL 
            ? "سيتم مراجعة العقار من قبل المشرفين" 
            : "Your property will be reviewed by administrators";
        }
      }

      toast({
        title: successMessage,
        description: descriptionMessage,
      });

      // Navigate to my ads page
      setTimeout(() => {
        navigate('/my-ads');
      }, 1000);

    } catch (error: any) {
      console.error("Error submitting property:", error);
      const errorMessage = error.message || (isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
      setServerError(errorMessage);

      toast({
        title: isRTL ? "❌ فشل في إرسال العقار" : "❌ Failed to submit property",
        description: errorMessage,
        variant: "destructive"
      });

      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-8 pb-16 px-4 flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">
            {isRTL ? 'جاري تحميل بيانات العقار...' : 'Loading property data...'}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-6 pb-16 px-3 sm:px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-7xl">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-4 sm:p-6 md:p-8">
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold text-white ${isRTL ? 'text-right' : ''}`}>
              {isEditMode 
                ? (isRTL ? "✏️ تعديل العقار" : "✏️ Edit Property")
                : (isRTL ? "➕ إضافة عقار جديد" : "➕ Add New Property")
              }
            </h1>
            <p className={`text-emerald-100 mt-2 text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}>
              {isEditMode
                ? (isRTL ? "قم بتحديث تفاصيل العقار" : "Update your property details")
                : (isRTL ? "أدخل تفاصيل عقارك ليتم عرضه للمشترين المحتملين" : "Enter your property details to list it for potential buyers")
              }
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded-lg">
              <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-start gap-3`}>
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-1">
                    {isRTL ? "خطأ في الخادم" : "Server Error"}
                  </h3>
                  <p className="text-red-700 text-sm whitespace-pre-line">{serverError}</p>
                </div>
                <button
                  onClick={() => setServerError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
            {/* Left Column - Main Form */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div className={`bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6 rounded-xl border border-emerald-200 ${isRTL ? 'text-right' : ''}`}>
                <h2 className={`text-lg sm:text-xl font-semibold text-emerald-800 mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Home className="h-5 w-5 text-emerald-600" />
                  {isRTL ? "معلومات العقار الأساسية" : "Basic Property Information"}
                </h2>
                
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <Label 
                      htmlFor="title" 
                      className={`text-sm font-medium ${errors.title ? 'text-red-500' : 'text-gray-700'}`}
                    >
                      {isRTL ? "عنوان العقار" : "Property Title"}
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder={isRTL ? "مثال: شقة فاخرة بمنظر على النيل" : "E.g., Luxury apartment with Nile view"}
                      className={`mt-1 ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                  </div>
                  
                  {/* Description */}
                  <div>
                    <Label 
                      htmlFor="description" 
                      className={`text-sm font-medium ${errors.description ? 'text-red-500' : 'text-gray-700'}`}
                    >
                      {isRTL ? "وصف العقار" : "Property Description"}
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder={isRTL ? "اكتب وصفًا تفصيليًا للعقار..." : "Write a detailed description of your property..."}
                      rows={5}
                      className={`mt-1 ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                  </div>

                  {/* Price */}
                  <div>
                    <Label 
                      htmlFor="price" 
                      className={`text-sm font-medium ${errors.price ? 'text-red-500' : 'text-gray-700'}`}
                    >
                      {isRTL ? "السعر (جنيه مصري)" : "Price (EGP)"}
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <DollarSign className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                      <Input
                        id="price"
                        type="number"
                        value={form.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        placeholder={isRTL ? "أدخل السعر" : "Enter price"}
                        className={`${isRTL ? 'pr-10' : 'pl-10'} ${errors.price ? 'border-red-500 focus:ring-red-500' : ''}`}
                      />
                    </div>
                    {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className={`bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6 rounded-xl border border-emerald-200 ${isRTL ? 'text-right' : ''}`}>
                <h2 className={`text-lg sm:text-xl font-semibold text-emerald-800 mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  {isRTL ? "موقع العقار" : "Property Location"}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Governorate */}
                  <div>
                    <Label 
                      htmlFor="location_governorate" 
                      className={`text-sm font-medium ${errors.location_governorate ? 'text-red-500' : 'text-gray-700'}`}
                    >
                      {isRTL ? "المحافظة" : "Governorate"}
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select 
                      value={form.location_governorate}
                      onValueChange={(value) => handleChange("location_governorate", value)}
                    >
                      <SelectTrigger 
                        id="location_governorate"
                        className={`mt-1 ${errors.location_governorate ? 'border-red-500' : ''}`}
                      >
                        <SelectValue 
                          placeholder={isRTL ? "اختر المحافظة" : "Select governorate"} 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {governorates.map((governorate) => (
                          <SelectItem key={governorate.id} value={String(governorate.id)}>
                            {isRTL ? governorate.name_ar : governorate.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.location_governorate && <p className="mt-1 text-sm text-red-500">{errors.location_governorate}</p>}
                  </div>
                  
                  {/* City */}
                  <div>
                    <Label 
                      htmlFor="location_city" 
                      className={`text-sm font-medium ${errors.location_city ? 'text-red-500' : 'text-gray-700'}`}
                    >
                      {isRTL ? "المدينة" : "City"}
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select 
                      value={form.location_city}
                      onValueChange={(value) => handleChange("location_city", value)}
                      disabled={!form.location_governorate || cities.length === 0}
                    >
                      <SelectTrigger 
                        id="location_city"
                        className={`mt-1 ${errors.location_city ? 'border-red-500' : ''}`}
                      >
                        <SelectValue 
                          placeholder={isRTL ? "اختر المدينة" : "Select city"} 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={String(city.id)}>
                            {isRTL ? city.name_ar : city.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.location_city && <p className="mt-1 text-sm text-red-500">{errors.location_city}</p>}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className={`bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6 rounded-xl border border-emerald-200 ${isRTL ? 'text-right' : ''}`}>
                <h2 className={`text-lg sm:text-xl font-semibold text-emerald-800 mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <ImageIcon className="h-5 w-5 text-emerald-600" />
                  {isRTL ? "صور العقار" : "Property Images"}
                </h2>
                
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImagesChange}
                    className="hidden"
                  />
                  
                  {/* Upload Area */}
                  <div 
                    onClick={triggerFileInput}
                    className={`
                      border-2 border-dashed rounded-xl p-6 sm:p-8 
                      flex flex-col items-center justify-center
                      cursor-pointer transition-all duration-200
                      ${errors.images 
                        ? 'border-red-400 bg-red-50 hover:bg-red-100' 
                        : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400'
                      }
                    `}
                  >
                    <CloudUpload className={`h-10 w-10 sm:h-12 sm:w-12 mb-3 ${errors.images ? 'text-red-500' : 'text-emerald-500'}`} />
                    <p className={`text-center font-medium text-sm sm:text-base ${errors.images ? 'text-red-700' : 'text-gray-700'}`}>
                      {isRTL ? "اضغط لتحميل الصور" : "Click to upload images"}
                    </p>
                    <p className="text-center text-gray-500 text-xs sm:text-sm mt-1">
                      {isRTL ? "يمكنك تحميل حتى 5 صور (JPG, PNG, GIF)" : "You can upload up to 5 images (JPG, PNG, GIF)"}
                      <br />
                      <span className={`font-semibold ${existingImages.length + form.images.length >= 5 ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {isRTL ? `(${existingImages.length + form.images.length}/5)` : `(${existingImages.length + form.images.length}/5)`}
                      </span>
                    </p>
                  </div>
                  {errors.images && <p className="mt-2 text-sm text-red-500 font-medium">{errors.images}</p>}
                  
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="mt-6">
                      <h3 className={`text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {isRTL ? `الصور الحالية (${existingImages.length})` : `Current Images (${existingImages.length})`}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                        {existingImages.map((image, index) => (
                          <div key={`existing-${image.id}-${index}`} className="relative group">
                            <img 
                              src={image.url} 
                              alt={`Existing ${index + 1}`} 
                              className="w-full h-28 sm:h-32 object-cover rounded-lg shadow-md border-2 border-green-300 transition-transform group-hover:scale-105"
                              onError={(e) => {
                                console.error('Failed to load image:', image.url);
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            <div className={`absolute top-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md shadow-md ${isRTL ? 'right-2' : 'left-2'}`}>
                              ✓ {isRTL ? "موجودة" : "Saved"}
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeExistingImage(index);
                              }}
                              className={`absolute top-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg ${isRTL ? 'left-2' : 'right-2'}`}
                              title={isRTL ? "إزالة الصورة" : "Remove image"}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* New Images Preview */}
                  {imagePreviewUrls.length > 0 && (
                    <div className="mt-6">
                      <h3 className={`text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <CloudUpload className="w-4 h-4 text-blue-600" />
                        {isRTL ? `صور جديدة (${imagePreviewUrls.length}) - سيتم رفعها` : `New Images (${imagePreviewUrls.length}) - to be uploaded`}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={`new-${index}-${url}`} className="relative group">
                            <img 
                              src={url} 
                              alt={`Preview ${index + 1}`} 
                              className="w-full h-28 sm:h-32 object-cover rounded-lg shadow-md border-2 border-blue-300 transition-transform group-hover:scale-105"
                            />
                            <div className={`absolute top-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md shadow-md ${isRTL ? 'right-2' : 'left-2'}`}>
                              ✨ {isRTL ? "جديدة" : "New"}
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className={`absolute top-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg ${isRTL ? 'left-2' : 'right-2'}`}
                              title={isRTL ? "إزالة الصورة" : "Remove image"}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className={`bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6 rounded-xl border border-emerald-200 lg:sticky lg:top-20 ${isRTL ? 'text-right' : ''}`}>
                <h2 className={`text-lg sm:text-xl font-semibold text-emerald-800 mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Info className="h-5 w-5 text-emerald-600" />
                  {isRTL ? "تفاصيل إضافية" : "Additional Details"}
                </h2>
                
                <div className="space-y-4">
                  {/* Category */}
                  <div>
                    <Label 
                      htmlFor="category" 
                      className={`text-sm font-medium ${errors.category ? 'text-red-500' : 'text-gray-700'}`}
                    >
                      {isRTL ? "نوع العقار" : "Property Type"}
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select 
                      value={form.category}
                      onValueChange={(value) => handleChange("category", value)}
                    >
                      <SelectTrigger 
                        id="category"
                        className={`mt-1 ${errors.category ? 'border-red-500' : ''}`}
                      >
                        <SelectValue placeholder={isRTL ? "اختر نوع العقار" : "Select property type"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="villa">{isRTL ? "🏰 فيلا" : "🏰 Villa"}</SelectItem>
                        <SelectItem value="apartment">{isRTL ? "🏢 شقة" : "🏢 Apartment"}</SelectItem>
                        <SelectItem value="townhouse">{isRTL ? "🏘️ تاون هاوس" : "🏘️ Townhouse"}</SelectItem>
                        <SelectItem value="land">{isRTL ? "🌾 أرض" : "🌾 Land"}</SelectItem>
                        <SelectItem value="building">{isRTL ? "🏗️ مبنى" : "🏗️ Building"}</SelectItem>
                        <SelectItem value="commercial">{isRTL ? "🏪 تجاري" : "🏪 Commercial"}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                  </div>
                  
                  {/* Listing Type */}
                  <div>
                    <Label 
                      htmlFor="rent_or_buy" 
                      className={`text-sm font-medium ${errors.rent_or_buy ? 'text-red-500' : 'text-gray-700'}`}
                    >
                      {isRTL ? "نوع العرض" : "Listing Type"}
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select 
                      value={form.rent_or_buy}
                      onValueChange={(value) => handleChange("rent_or_buy", value)}
                    >
                      <SelectTrigger 
                        id="rent_or_buy"
                        className={`mt-1 ${errors.rent_or_buy ? 'border-red-500' : ''}`}
                      >
                        <SelectValue placeholder={isRTL ? "اختر نوع العرض" : "Select listing type"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">{isRTL ? "💰 للبيع" : "💰 For Sale"}</SelectItem>
                        <SelectItem value="rent">{isRTL ? "🔑 للإيجار" : "🔑 For Rent"}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.rent_or_buy && <p className="mt-1 text-sm text-red-500">{errors.rent_or_buy}</p>}
                  </div>
                  
                  {/* Optional Fields */}
                  <div className="pt-3 border-t-2 border-emerald-200">
                    <p className="text-xs sm:text-sm text-emerald-600 font-semibold mb-3">
                      {isRTL ? "📝 معلومات إضافية (اختيارية)" : "📝 Additional info (optional)"}
                    </p>
                    
                    <div className="space-y-3">
                      {/* Bedrooms */}
                      <div>
                        <Label htmlFor="bedrooms" className="text-sm font-medium text-gray-700">
                          {isRTL ? "🛏️ عدد غرف النوم" : "🛏️ Bedrooms"}
                        </Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          min="0"
                          max="20"
                          value={form.bedrooms || ""}
                          onChange={(e) => handleChange("bedrooms", e.target.value)}
                          placeholder={isRTL ? "مثال: 3" : "E.g., 3"}
                          className="mt-1"
                        />
                      </div>
                      
                      {/* Bathrooms */}
                      <div>
                        <Label htmlFor="bathrooms" className="text-sm font-medium text-gray-700">
                          {isRTL ? "🚿 عدد الحمامات" : "🚿 Bathrooms"}
                        </Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          min="0"
                          max="10"
                          value={form.bathrooms || ""}
                          onChange={(e) => handleChange("bathrooms", e.target.value)}
                          placeholder={isRTL ? "مثال: 2" : "E.g., 2"}
                          className="mt-1"
                        />
                      </div>
                      
                      {/* Area */}
                      <div>
                        <Label htmlFor="area" className="text-sm font-medium text-gray-700">
                          {isRTL ? "📏 المساحة (م²)" : "📏 Area (m²)"}
                        </Label>
                        <Input
                          id="area"
                          type="number"
                          min="0"
                          value={form.area || ""}
                          onChange={(e) => handleChange("area", e.target.value)}
                          placeholder={isRTL ? "مثال: 150" : "E.g., 150"}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="pt-6 mt-4 space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 sm:py-5 text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <div className={`flex items-center justify-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                          <span>{isEditMode 
                            ? (isRTL ? 'جاري التحديث...' : 'Updating...')
                            : (isRTL ? 'جاري الإرسال...' : 'Submitting...')
                          }</span>
                        </div>
                      ) : (
                        <div className={`flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span>
                            {isEditMode 
                              ? (isRTL ? '💾 تحديث العقار' : '💾 Update Property')
                              : (isRTL ? '✨ إضافة العقار' : '✨ Add Property')
                            }
                          </span>
                          <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                        </div>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/my-ads')}
                      className="w-full border-2 border-gray-300 hover:bg-gray-100 py-3 rounded-xl"
                      disabled={submitting}
                    >
                      {isRTL ? '❌ إلغاء' : '❌ Cancel'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;