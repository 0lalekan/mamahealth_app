import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Crown, MessageCircle, Baby } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading || user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="h-64 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/60" />
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
          <div className="text-white space-y-4 max-w-md">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="h-10 w-10 fill-current" />
              <h1 className="text-3xl font-bold">MamaCare</h1>
            </div>
            <p className="text-xl text-white/90">
              Your trusted pregnancy companion
            </p>
            <p className="text-white/80">
              AI-powered symptom checker, nurse support, and personalized care
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 -mt-8 relative z-10">
        {/* Features Preview */}
        <div className="grid gap-4">
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-center">Why Choose MamaCare?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">AI Symptom Checker</h4>
                  <p className="text-sm text-muted-foreground">
                    Get instant insights about pregnancy symptoms with AI analysis
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h4 className="font-semibold">Ask a Nurse</h4>
                  <p className="text-sm text-muted-foreground">
                    24/7 access to qualified nurses via WhatsApp when needed
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent/60 rounded-lg">
                  <Baby className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold">Pregnancy Tracker</h4>
                  <p className="text-sm text-muted-foreground">
                    Track your journey with weekly updates and insights
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-warning/20 rounded-lg">
                  <Crown className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h4 className="font-semibold">Premium Care</h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced features for comprehensive pregnancy support
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full bg-gradient-primary shadow-soft text-lg py-6">
              <Link to="/signup">
                Get Started Free
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">
                Already have an account? Sign In
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <Card className="shadow-soft bg-muted/30 border-0">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
                  <span>🔒 HIPAA Compliant</span>
                  <span>•</span>
                  <span>👩‍⚕️ Licensed Nurses</span>
                  <span>•</span>
                  <span>🤖 AI Powered</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Trusted by thousands of expecting mothers
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
