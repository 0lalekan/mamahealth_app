import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Suspense, lazy } from 'react';
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));
const LoginScreen = lazy(() => import('@/components/auth/LoginScreen').then(m=>({default:m.LoginScreen})));
const SignupScreen = lazy(() => import('@/components/auth/SignupScreen').then(m=>({default:m.SignupScreen})));
const ForgotPasswordScreen = lazy(() => import('@/components/auth/ForgotPasswordScreen').then(m=>({default:m.ForgotPasswordScreen})));
const Dashboard = lazy(() => import('@/components/dashboard/Dashboard').then(m=>({default:m.Dashboard})));
const SymptomChecker = lazy(() => import('@/components/symptom-checker/SymptomChecker').then(m=>({default:m.SymptomChecker})));
const AskNurse = lazy(() => import('@/components/nurse/AskNurse').then(m=>({default:m.AskNurse})));
const PremiumScreen = lazy(() => import('@/components/premium/PremiumScreen').then(m=>({default:m.PremiumScreen})));
const ProfileScreen = lazy(() => import('@/components/profile/ProfileScreen').then(m=>({default:m.ProfileScreen})));
const CommunityForum = lazy(() => import('@/pages/CommunityForum').then(m=>({default:m.CommunityForum})));
const ArticleLibrary = lazy(() => import('@/pages/ArticleLibrary').then(m=>({default:m.ArticleLibrary})));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const MedicalCenters = lazy(() => import('./pages/MedicalCenters'));

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppShell>
          <Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground animate-pulse">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignupScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/symptom-checker" element={<ProtectedRoute><SymptomChecker /></ProtectedRoute>} />
            <Route path="/ask-nurse" element={<ProtectedRoute><AskNurse /></ProtectedRoute>} />
            <Route path="/premium" element={<ProtectedRoute><PremiumScreen /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><CommunityForum /></ProtectedRoute>} />
            <Route path="/articles" element={<ProtectedRoute><ArticleLibrary /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
            <Route path="/medical-centers" element={<ProtectedRoute><MedicalCenters /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
