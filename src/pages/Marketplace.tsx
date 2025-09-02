import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import placeholder from "/placeholder.svg";
import { PageHeader } from '@/components/layout/PageHeader';
import { ShoppingBag } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  tag: string;
}

export const Marketplace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Error fetching products:", error);
      } else if (data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <PageHeader
        title="Marketplace"
        subtitle="Curated essentials for your journey"
        icon={<ShoppingBag className="h-5 w-5" />}
      />
      <div className="px-4 md:px-6 pb-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <img src={product.image_url || placeholder} alt={product.name} className="w-full h-32 object-cover" />
            </CardHeader>
            <CardContent className="p-4">
              <Badge variant="secondary" className="mb-2">{product.tag}</Badge>
              <CardTitle className="text-base font-semibold mb-1">{product.name}</CardTitle>
              <p className="text-lg font-bold text-primary">${product.price}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
