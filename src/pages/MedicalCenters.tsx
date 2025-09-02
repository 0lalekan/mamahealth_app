import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Hospital } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles } from "lucide-react";

interface MedicalCenter {
  id: number;
  name: string;
  address: string;
  phone: string;
}

export const MedicalCenters = () => {
  const [medicalCenters, setMedicalCenters] = useState<MedicalCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, user } = useAuth();

  useEffect(() => {
    const fetchMedicalCenters = async () => {
      const { data, error } = await supabase.from("medical_centers").select("*");
      if (error) {
        console.error("Error fetching medical centers:", error);
      } else if (data) {
        setMedicalCenters(data);
      }
      setLoading(false);
    };

    fetchMedicalCenters();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gradient-soft flex items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-lg">Please sign in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            You need to be signed in to view medical centers.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile.is_premium) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <PageHeader
          title="Medical Centers"
          subtitle="Premium feature: Unlock curated care locations near you"
          icon={<Hospital className="h-5 w-5" />}
        />
        <div className="px-4 md:px-6 pb-16 max-w-2xl">
          <Alert className="mb-6">
            <AlertDescription className="flex items-start gap-3 text-sm">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              Upgrade to Premium to access vetted medical centers and quick emergency dialing.
            </AlertDescription>
          </Alert>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Why upgrade?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ul className="list-disc ml-5 space-y-1">
                <li>Curated list of trusted maternal & child health facilities</li>
                <li>Direct tap-to-call integration</li>
                <li>Priority access to future location-based services</li>
              </ul>
              <Button asChild className="w-full mt-4 bg-gradient-primary">
                <a href="/premium">Upgrade to Premium</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <PageHeader
        title="Medical Centers"
        subtitle="Trusted care locations near you"
        icon={<Hospital className="h-5 w-5" />}
  actions={<a href="tel:+2349091481560"><Button size="sm" className="bg-red-500 hover:bg-red-600 text-white"><Phone className="mr-2 h-4 w-4" /> Emergency</Button></a>}
      />
      <div className="px-4 md:px-6 pb-10 space-y-4">
        {medicalCenters.map((center) => (
          <Card key={center.id}>
            <CardHeader>
              <CardTitle>{center.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{center.address}</p>
              <a href={`tel:${center.phone}`} className="text-primary hover:underline">
                {center.phone}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MedicalCenters;
