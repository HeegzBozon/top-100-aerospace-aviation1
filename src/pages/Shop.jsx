import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Award, BookOpen, Shirt, Gift, ArrowRight } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

const SHOP_CATEGORIES = [
  {
    id: 'publication',
    title: 'TOP 100 Publication',
    description: 'The official hardcover edition featuring all honorees',
    icon: BookOpen,
    badge: '2025 Edition',
    items: [
      {
        id: 'pub-hardcover',
        name: 'TOP 100 Women 2025 - Hardcover',
        description: 'Premium hardcover publication featuring all 100 honorees with full profiles and stunning photography.',
        price: '$79',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format',
        badge: 'Pre-Order',
      },
      {
        id: 'pub-digital',
        name: 'TOP 100 Women 2025 - Digital Edition',
        description: 'Instant access to the complete digital publication with interactive features.',
        price: '$29',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format',
        badge: 'Available Now',
      },
    ],
  },
  {
    id: 'merchandise',
    title: 'Official Merchandise',
    description: 'Premium apparel and accessories',
    icon: Shirt,
    badge: 'New Collection',
    items: [
      {
        id: 'merch-polo',
        name: 'TOP 100 Polo Shirt',
        description: 'Premium cotton polo with embroidered TOP 100 logo. Available in Navy and White.',
        price: '$65',
        image: 'https://images.unsplash.com/photo-1625910513413-5fc4e6d5b4fc?w=400&auto=format',
        badge: null,
      },
      {
        id: 'merch-cap',
        name: 'Aviation Heritage Cap',
        description: 'Structured cap with gold embroidery. One size fits most.',
        price: '$35',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format',
        badge: null,
      },
    ],
  },
  {
    id: 'recognition',
    title: 'Recognition Items',
    description: 'For honorees and sponsors',
    icon: Award,
    badge: 'Honoree Exclusive',
    items: [
      {
        id: 'rec-plaque',
        name: 'Crystal Recognition Award',
        description: 'Personalized crystal award for TOP 100 honorees with laser engraving.',
        price: '$195',
        image: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=400&auto=format',
        badge: 'Honorees Only',
      },
      {
        id: 'rec-certificate',
        name: 'Framed Certificate',
        description: 'Premium framed certificate of recognition with gold foil details.',
        price: '$125',
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format',
        badge: 'Honorees Only',
      },
    ],
  },
];

function ProductCard({ item }) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white" style={{ border: `1px solid ${brandColors.navyDeep}10` }}>
      <div className="aspect-square relative overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.badge && (
          <Badge 
            className="absolute top-3 left-3 text-white text-xs"
            style={{ background: brandColors.goldPrestige }}
          >
            {item.badge}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-1" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>
          {item.name}
        </h3>
        <p className="text-xs mb-3 line-clamp-2" style={{ color: brandColors.navyDeep, opacity: 0.7, fontFamily: "'Montserrat', sans-serif" }}>
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg" style={{ color: brandColors.goldPrestige }}>
            {item.price}
          </span>
          <Button 
            size="sm" 
            className="text-white text-xs"
            style={{ background: brandColors.navyDeep }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Shop() {
  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero Section */}
      <div 
        className="relative py-16 px-4"
        style={{ 
          background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShoppingBag className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              TOP 100 Shop
            </h1>
          </div>
          <p className="text-white/80 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Official merchandise, publications, and recognition items from TOP 100 Aerospace & Aviation
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {SHOP_CATEGORIES.map((category, idx) => (
          <section key={category.id} className={idx > 0 ? 'mt-16' : ''}>
            {/* Category Header */}
            <div className="flex items-center justify-between mb-6 pb-3" style={{ borderBottom: `2px solid ${brandColors.goldPrestige}30` }}>
              <div className="flex items-center gap-3">
                <category.icon className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>
                    {category.title}
                  </h2>
                  <p className="text-sm" style={{ color: brandColors.navyDeep, opacity: 0.6, fontFamily: "'Montserrat', sans-serif" }}>
                    {category.description}
                  </p>
                </div>
              </div>
              {category.badge && (
                <Badge 
                  className="text-white"
                  style={{ background: brandColors.skyBlue }}
                >
                  {category.badge}
                </Badge>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.items.map(item => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}

        {/* Coming Soon Notice */}
        <div 
          className="mt-16 p-8 rounded-2xl text-center"
          style={{ background: `${brandColors.navyDeep}05`, border: `2px dashed ${brandColors.navyDeep}20` }}
        >
          <Gift className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>
            More Coming Soon
          </h3>
          <p className="text-sm mb-4" style={{ color: brandColors.navyDeep, opacity: 0.7, fontFamily: "'Montserrat', sans-serif" }}>
            We're expanding our collection with new items. Stay tuned for exclusive drops and limited editions.
          </p>
          <Link to={createPageUrl('Landing')}>
            <Button 
              variant="outline"
              style={{ borderColor: brandColors.goldPrestige, color: brandColors.goldPrestige }}
            >
              Back to Home
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}