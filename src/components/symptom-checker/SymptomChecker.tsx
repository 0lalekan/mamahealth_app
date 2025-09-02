import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, AlertTriangle, CheckCircle, Loader2, Sparkles, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SymptomAnalysis {
  causes?: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export const SymptomChecker = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  
  // Use the LMP date from the user's profile to calculate the week
  const calculateCurrentWeek = () => {
    if (!profile?.lmp_date) return null;
    const lmp = new Date(profile.lmp_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lmp.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  };
  const currentWeek = calculateCurrentWeek();

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysis(null);

    const isPremium = profile?.is_premium || false;
    
    try {
      const { data, error } = await supabase.functions.invoke('get-ai-response', {
        body: { 
          message: symptoms,
          is_premium: isPremium,
          week: currentWeek
        },
      });

      if (error) throw error;

      if (data.analysis) {
        setAnalysis(data.analysis);
      } else {
        // Handle cases where analysis might be a string from a non-JSON response
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data);
            if(parsed.analysis) {
              setAnalysis(parsed.analysis);
            } else {
               throw new Error("Parsed data does not contain analysis.");
            }
          } catch (e) {
            throw new Error("Failed to parse analysis response from server.");
          }
        } else {
          throw new Error("Invalid analysis response from server.");
        }
      }

    } catch (error: any) {
      console.error("Error analyzing symptoms:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Could not get a response from the AI assistant. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskBadge = (level: string) => {
    // ... existing code ...
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <PageHeader
        title="Symptom Checker"
        subtitle="Describe what you're feeling to get insights"
        icon={<Activity className="h-5 w-5" />}
      />
      <div className="max-w-2xl mx-auto px-4 md:px-6 pb-10">
      <div className="bg-white dark:bg-muted/40 backdrop-blur rounded-lg shadow-card p-6">
      <h2 className="text-xl font-semibold mb-4">Describe Your Symptoms</h2>
      <Textarea
        className="w-full border rounded p-2 mb-4"
        rows={4}
        value={symptoms}
        onChange={e => setSymptoms(e.target.value)}
        placeholder="Describe your symptoms..."
      />
      <Button onClick={handleAnalyze} disabled={isAnalyzing || !symptoms}>
        {isAnalyzing ? "Analyzing..." : "Check Symptoms"}
      </Button>

  {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4 mt-6">
          {/* Risk Level */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">Risk Level</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge>{analysis.riskLevel}</Badge>
            </CardContent>
          </Card>

          {/* Possible Causes - Premium Only */}
          {analysis.causes && profile?.is_premium && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">Possible Causes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.causes.map((cause, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{cause}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations - Premium Only */}
          {profile?.is_premium && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc ml-6">
                  {Array.isArray(analysis.recommendations)
                    ? analysis.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))
                    : <li>{analysis.recommendations}</li>}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* General Recommendation for Free Users */}
          {!profile?.is_premium && analysis.recommendations && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">General Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{analysis.recommendations[0]}</p>
              </CardContent>
            </Card>
          )}

          {/* Upgrade CTA for Free Users */}
          {!profile?.is_premium && (
            <Card className="shadow-card border-0 bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Unlock Detailed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upgrade to MamaCare Plus for a detailed analysis, including possible causes and a personalized action plan.
                </p>
                <Button asChild className="w-full bg-gradient-primary shadow-soft">
                  <Link to="/premium">Upgrade Now</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* High Risk Alert */}
          {analysis.riskLevel === 'high' && (
            <Alert className="border-destructive/20 bg-destructive/5">
              <AlertDescription>
                <AlertTriangle className="h-5 w-5 text-destructive inline mr-2" />
                This may be a high-risk symptom. Please contact a healthcare provider immediately.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

  {/* Disclaimer */}
  <Alert className="border-muted bg-muted/30 mt-6">
        <AlertDescription>
          <Heart className="h-4 w-4 text-muted-foreground inline mr-2" />
          This tool does not provide medical diagnosis. Always consult a healthcare professional for urgent or serious symptoms.
        </AlertDescription>
      </Alert>
  </div>
  </div>
    </div>
  );
}
