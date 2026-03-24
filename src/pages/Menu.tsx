import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_URL } from "@/config/api";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
}

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ["All", "Breakfast", "Main Dishes", "Drinks", "Desserts"];

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      console.log('🍽️ Loading menu items...');
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/menu_items`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to load menu items: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Menu items loaded:', data);
      
      // Make sure data is an array
      const items = Array.isArray(data) ? data : [];
      setMenuItems(items);
      
      if (items.length === 0) {
        setError("No menu items available at the moment.");
      }
    } catch (error) {
      console.error("❌ Error loading menu items:", error);
      setError((error as Error).message || "Failed to load menu items");
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeCategory === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Our Menu</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We consider all the drivers of change gives you the components you need to change to create a truly happens.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className="min-w-[120px]"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-800">{error}</p>
                <Button 
                  onClick={loadMenuItems} 
                  variant="outline" 
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Menu Items Grid */}
          {!error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredItems.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    {activeCategory === "All" 
                      ? "No menu items available" 
                      : `No items in ${activeCategory} category`}
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                <span class="text-6xl">🍽️</span>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-6xl">🍽️</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-primary mb-2">
                        ${Number(item.price).toFixed(2)}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {item.description}
                      </p>
                      <div className="mt-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Available
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Call to Action */}
          {!error && filteredItems.length > 0 && (
            <div className="text-center mt-12">
              <p className="text-lg text-muted-foreground mb-4">
                Ready to order? Book a table now!
              </p>
              <Button size="lg" asChild>
                <a href="/booking">Book A Table</a>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Menu;
