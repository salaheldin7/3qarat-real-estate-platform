// API Configuration
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
export const API_URL = `${API_BASE_URL}/api`;

// Helper function to get full image URL
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};
