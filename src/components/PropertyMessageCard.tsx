import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Home, Building, Eye } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PropertyMessageCardProps {
  propertyData: {
    id: string;
    title: string;
    description?: string;
    price: number;
    location_city: string;
    location_governorate: string;
    rent_or_buy: string;
    images: string[];
    category: string;
  };
}

export const PropertyMessageCard: React.FC<PropertyMessageCardProps> = ({ propertyData }) => {
  const navigate = useNavigate();
  
  const formatPrice = (price: number, type: string) => {
    const formatted = new Intl.NumberFormat('en-US').format(price);
    return type === 'rent' ? `${formatted} EGP/month` : `${formatted} EGP`;
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'villa':
      case 'townhouse':
        return <Home className="w-3 h-3" />;
      case 'apartment':
      case 'building':
        return <Building className="w-3 h-3" />;
      default:
        return <Home className="w-3 h-3" />;
    }
  };
  
  return (
    <Card className="max-w-sm overflow-hidden hover:shadow-lg transition-all border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/20">
      <div className="relative cursor-pointer" onClick={() => navigate(`/property/${propertyData.id}`)}>
        {propertyData.images && propertyData.images[0] ? (
          <img
            src={propertyData.images[0]}
            alt={propertyData.title}
            className="w-full h-32 object-cover"
          />
        ) : (
          <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
            <Home className="w-12 h-12 text-gray-400" />
          </div>
        )}
                
        <Badge 
          className={`absolute top-2 left-2 ${
            propertyData.rent_or_buy === 'rent' ? 'bg-blue-600' : 'bg-green-600'
          } text-white text-xs shadow-md`}
        >
          {propertyData.rent_or_buy === 'rent' ? 'Rent' : 'Buy'}
        </Badge>
      </div>
      
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <span className="mt-0.5">{getCategoryIcon(propertyData.category)}</span>
          <h4 
            className="font-semibold text-sm leading-tight line-clamp-2 cursor-pointer hover:text-blue-600"
            onClick={() => navigate(`/property/${propertyData.id}`)}
          >
            {propertyData.title}
          </h4>
        </div>
        
        {propertyData.description && (
          <p className="text-xs text-gray-600 line-clamp-2">{propertyData.description}</p>
        )}
        
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="w-3 h-3 text-red-500" />
          <span className="truncate">{propertyData.location_city}, {propertyData.location_governorate}</span>
        </div>
        
        <div className="flex items-center gap-1.5 pt-1 border-t">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-base font-bold text-green-600">
            {formatPrice(propertyData.price, propertyData.rent_or_buy)}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 pt-0">
        <Button 
          onClick={() => navigate(`/property/${propertyData.id}`)}
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          View Property
        </Button>
      </CardFooter>
    </Card>
  );
};