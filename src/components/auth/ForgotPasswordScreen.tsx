import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Heart, ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await resetPassword(email);
    
    if (!error) {
      setIsSubmitted(true);
    }
    
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-soft flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary mr-2 fill-current" />
              <h1 className="text-2xl font-bold text-foreground">MamaCare</h1>
            </div>
          </div>

          <Card className="shadow-card border-0 text-center">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Check your email</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    We've sent password reset instructions to <strong>{email}</strong>
                  </p>
                </div>
                <Button asChild className="w-full bg-gradient-primary">
                  <Link to="/login">Back to Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <Heart className="h-8 w-8 text-primary mr-2 fill-current" />
            <h1 className="text-2xl font-bold text-foreground">MamaCare</h1>
          </div>
          <p className="text-muted-foreground">Reset your password</p>
        </div>

        {/* Reset Form */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary shadow-soft"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};