import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Crown, User, Baby, Calendar, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-image.jpg";

const pregnancyWeeks = [
  { week: 1, fruit: "Poppy seed", size: "0.1cm" },
  { week: 4, fruit: "Poppy seed", size: "0.2cm" },
  { week: 8, fruit: "Raspberry", size: "1.6cm" },
  { week: 12, fruit: "Lime", size: "5.4cm" },
  { week: 16, fruit: "Avocado", size: "11.6cm" },
  { week: 20, fruit: "Banana", size: "16.4cm" },
  { week: 24, fruit: "Ear of corn", size: "21cm" },
  { week: 28, fruit: "Eggplant", size: "25cm" },
  { week: 32, fruit: "Squash", size: "28cm" },
  { week: 36, fruit: "Romaine lettuce", size: "32.2cm" },
  { week: 40, fruit: "Watermelon", size: "36.2cm" }
];

export const Dashboard = () => {
  const { profile, signOut } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calculatePregnancyDetails = () => {
      if (!profile?.lmp_date) return;

      const lmp = new Date(profile.lmp_date.replace(/-/g, '\/'));
      const today = new Date();
      
      // Set time to midnight to compare dates only
      lmp.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - lmp.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Gestational age in weeks
      const gestationalAgeWeeks = Math.floor(diffDays / 7);
      
      const dueDate = new Date(lmp.getTime() + (280 * 24 * 60 * 60 * 1000));
      const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      setCurrentWeek(Math.max(1, Math.min(42, gestationalAgeWeeks + 1))); // Cap at 42 weeks
      setDaysLeft(Math.max(0, daysRemaining));
    };

    if (profile) {
      calculatePregnancyDetails();
    }
  }, [profile]);

  const getCurrentWeekInfo = () => {
    // Find the closest week info that doesn't exceed current week
    const weekInfos = pregnancyWeeks.filter(w => w.week <= currentWeek);
    return weekInfos.length > 0 ? weekInfos[weekInfos.length - 1] : pregnancyWeeks[0];
  };

  const weekInfo = getCurrentWeekInfo();

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="h-48 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/40" />
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          
          <div className="text-white space-y-1">
            <h1 className="text-2xl font-bold">
              Hi {profile?.full_name || 'there'}! 👋
            </h1>
            <p className="text-white/90">
              {currentWeek > 0 ? `You're ${currentWeek} weeks pregnant 🤱` : 'Welcome to your pregnancy journey! 🤱'}
            </p>
          </div>
        </div>

        {/* Premium Badge */}
        {profile?.is_premium && (
          <Badge className="absolute top-4 left-4 bg-warning text-warning-foreground">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-6 -mt-6 relative z-10">
        {/* Pregnancy Progress */}
        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Week {currentWeek}</h3>
                <p className="text-muted-foreground">
                  Your baby is about the size of a <strong>{weekInfo.fruit}</strong>
                </p>
                <div className="text-sm text-muted-foreground">
                  Length: {weekInfo.size}
                </div>
              </div>
              
              <div className="bg-secondary rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-primary transition-all duration-1000"
                  style={{ width: `${(currentWeek / 40) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Conception</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{daysLeft} days left</span>
                </div>
                <span className="text-muted-foreground">Due Date</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="shadow-soft hover:shadow-glow transition-all duration-300 cursor-pointer">
            <Link to="/symptom-checker">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">AI Symptom Checker</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Get instant health insights
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="shadow-soft hover:shadow-glow transition-all duration-300 cursor-pointer">
            <Link to={profile?.is_premium ? "/ask-nurse" : "/premium"}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Ask a Nurse</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Connect with healthcare professionals
                      </p>
                    </div>
                  </div>
                  {!profile?.is_premium && (
                    <Badge variant="secondary" className="text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Link>
          </Card>

          {!profile?.is_premium && (
            <Card className="shadow-soft border-warning/20 bg-warning/5">
              <Link to="/premium">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-warning/20 rounded-lg">
                      <Crown className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-warning">Go Premium</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Unlock AI health insights & more
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>
          )}

          <Card className="shadow-soft hover:shadow-glow transition-all duration-300 cursor-pointer">
            <Link to="/profile">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent/60 rounded-lg">
                    <User className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Profile Settings</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage your account and preferences
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Community & Learning */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-soft hover:shadow-glow transition-all duration-300 cursor-pointer">
            <Link to="/community">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-info/10 rounded-lg">
                    <Baby className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Community Forum</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Connect with other moms
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="shadow-soft hover:shadow-glow transition-all duration-300 cursor-pointer">
            <Link to="/articles">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-secondary/60 rounded-lg">
                    <User className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Article Library</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Expert pregnancy guides
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="shadow-soft hover:shadow-glow transition-all duration-300 cursor-pointer">
            <Link to="/marketplace">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Heart className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Marketplace</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Shop for baby essentials
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="shadow-soft hover:shadow-glow transition-all duration-300 cursor-pointer">
            <Link to="/medical-centers">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Medical Centers</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Find clinics and pharmacies
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};