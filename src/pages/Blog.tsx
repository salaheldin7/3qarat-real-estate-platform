import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, User, Tag } from "lucide-react";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "How to prepare a delicious gluten free sushi",
      date: "January 15, 2024",
      readTime: "8 min read",
      author: "Chef Maria",
      category: "Healthy Cooking",
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop&crop=center",
      excerpt: "Master the art of gluten-free sushi with traditional techniques and fresh ingredients. Learn the secrets that professional chefs use to create perfect rolls every time.",
      featured: true
    },
    {
      id: 2,
      title: "Exclusive baking lessons from the pastry king",
      date: "January 12, 2024",
      readTime: "12 min read",
      author: "Chef Antoine",
      category: "Baking",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop&crop=center",
      excerpt: "Discover professional baking secrets from our award-winning pastry chef. From croissants to macarons, elevate your baking game with insider techniques."
    },
    {
      id: 3,
      title: "How to prepare the perfect fries in an air fryer",
      date: "January 10, 2024",
      readTime: "6 min read",
      author: "Chef David",
      category: "Quick Recipes",
      image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop&crop=center",
      excerpt: "Achieve restaurant-quality crispy fries at home using an air fryer. Learn the perfect temperature, timing, and seasoning combinations."
    },
    {
      id: 4,
      title: "How to prepare delicious chicken tenders",
      date: "January 8, 2024",
      readTime: "10 min read",
      author: "Chef Sarah",
      category: "Main Courses",
      image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop&crop=center",
      excerpt: "Create juicy, perfectly seasoned chicken tenders with our signature coating blend. Tips for marinating, breading, and cooking to perfection."
    },
    {
      id: 5,
      title: "5 great cooking gadgets you can buy to save time",
      date: "January 5, 2024",
      readTime: "7 min read",
      author: "Chef Michael",
      category: "Kitchen Tips",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop&crop=center",
      excerpt: "Discover essential kitchen tools that will transform your cooking experience. From prep to cleanup, these gadgets will save you valuable time."
    },
    {
      id: 6,
      title: "The secret tips & tricks to prepare a perfect burger",
      date: "January 3, 2024",
      readTime: "9 min read",
      author: "Chef Robert",
      category: "Grilling",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop&crop=center",
      excerpt: "Master the art of burger making with professional techniques. From selecting the right meat blend to perfecting your grilling method."
    },
    {
      id: 7,
      title: "7 delicious cheesecake recipes you can prepare",
      date: "December 30, 2023",
      readTime: "15 min read",
      author: "Chef Isabella",
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop&crop=center",
      excerpt: "From classic New York style to exotic flavor combinations, explore our collection of irresistible cheesecake recipes that will wow your guests."
    },
    {
      id: 8,
      title: "5 great pizza restaurants you should visit this city",
      date: "December 28, 2023",
      readTime: "5 min read",
      author: "Food Critic",
      category: "Restaurant Guide",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop&crop=center",
      excerpt: "Discover the hidden gems and popular hotspots for the best pizza in our city. From authentic Neapolitan to creative artisanal pies."
    }
  ];

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div>
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-red-500/5"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-orange-100 text-orange-800 font-medium mb-8">
              <Tag className="w-4 h-4" />
              <span>Culinary Stories</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Our Blog & Articles
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              Discover culinary secrets, cooking techniques, and food stories from our expert chefs. 
              Your journey to culinary mastery starts here.
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && (
            <div className="mb-20">
              <Card className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-[1.02] bg-white/80 backdrop-blur-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="aspect-[4/3] lg:aspect-auto overflow-hidden">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center space-x-4 mb-6">
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-full text-sm font-semibold">
                        Featured
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {featuredPost.category}
                      </span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 group-hover:text-orange-700 transition-colors duration-300">
                      {featuredPost.title}
                    </h2>
                    
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{featuredPost.author}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{featuredPost.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{featuredPost.readTime}</span>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="group/btn border-2 border-orange-500/30 hover:border-orange-500 text-orange-700 hover:text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-600 transition-all duration-300">
                        <span className="flex items-center space-x-2">
                          <span>Read More</span>
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Regular Posts Grid */}
          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-12 text-center">
              Latest Articles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <Card key={post.id} className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 cursor-pointer bg-white/80 backdrop-blur-sm">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full text-xs font-semibold shadow-lg">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-700 transition-colors duration-300 line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 font-medium">{post.author}</span>
                      </div>
                      
                      <Button variant="link" className="text-orange-600 hover:text-red-600 p-0 h-auto font-semibold group-hover:translate-x-1 transition-transform duration-300">
                        <span className="flex items-center space-x-1">
                          <span className="text-sm">Read More</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Load More Section */}
          <div className="text-center mt-16">
            <div className="relative group inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Button size="lg" className="relative bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-10 py-6 text-lg rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-500">
                <span className="flex items-center space-x-3">
                  <span>Load More Articles</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;