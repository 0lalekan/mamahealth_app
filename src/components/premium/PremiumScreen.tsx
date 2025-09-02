import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Heart, MessageCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from '@/components/layout/PageHeader';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const premiumFeatures = [
	{
		icon: Heart,
		title: "AI Symptom Checker",
		description: "Get instant health insights with AI-powered analysis",
		included: true
	},
	{
		icon: MessageCircle,
		title: "Priority Nurse Support",
		description: "Skip the queue and get faster responses from nurses",
		included: true
	},
	{
		icon: Sparkles,
		title: "Personalized Insights",
		description: "Weekly health tips tailored to your pregnancy stage",
		included: true
	},
	{
		icon: Crown,
		title: "Ad-Free Experience",
		description: "Enjoy MamaCare without any distractions",
		included: true
	}
];

export const PremiumScreen = () => {
	const [isLoading, setIsLoading] = useState(false);
	const { profile, user, updateProfile } = useAuth();
	const navigate = useNavigate();
	const { toast } = useToast();

	// Return a loading state if user or profile data is not yet available
	if (!user || !profile) {
		return (
			<div className="flex items-center justify-center h-screen bg-gradient-soft">
				<div>Loading user data...</div>
			</div>
		);
	}

	const config = {
		public_key: 'FLWPUBK-1bbe3fd0acff78a812b106b3ea58e959-X', // Replace with your key
		tx_ref: `mamacare-${Date.now()}`,
		amount: 2500,
		currency: 'NGN',
		payment_options: 'card,mobilemoney,ussd',
		customer: {
			email: user.email,
			phone_number: profile.phone_number || '',
			name: profile.full_name || '',
		},
		customizations: {
			title: 'MamaCare Premium',
			description: 'Payment for one month of premium access.',
			logo: 'https://user-images.githubusercontent.com/22942269/214901981-336391ac-2575-4a04-8683-04934a33a3f3.png', // Replace with your logo URL
		},
	};

	const handleFlutterwavePayment = useFlutterwave(config);

	const handleGoToPremium = () => {
		// Add a more robust check to ensure email is not empty
		if (!user.email || user.email.trim() === '') {
			toast({
				variant: "destructive",
				title: "Email Missing",
				description: "Your email is not set. Please update your profile before upgrading.",
			});
			return;
		}

		setIsLoading(true);
		handleFlutterwavePayment({
			callback: async (response) => {
				console.log(response);
				if (response.status === 'successful') {
					await updateProfile({ is_premium: true });
					toast({
						title: "Upgrade Successful!",
						description: "Welcome to MamaCare Premium.",
					});
					navigate('/dashboard');
				} else {
					toast({
						variant: "destructive",
						title: "Upgrade Failed",
						description: "Payment was not successful. Please try again.",
					});
				}
				closePaymentModal(); // this will close the modal
				setIsLoading(false);
			},
			onClose: () => {
				setIsLoading(false);
			},
		});
	};

	return (
		<div className="min-h-screen bg-gradient-soft">
			<PageHeader
				title="MamaCare Premium"
				subtitle="Enhanced pregnancy care for you and your baby"
				icon={<Crown className="h-6 w-6" />}
			/>

			<div className="px-4 md:px-6 pb-10 space-y-6">
				{/* Pricing Card */}
				<Card className="shadow-glow border-2 border-primary/20">
					<CardHeader className="text-center">
						<div className="space-y-2">
							<Badge className="bg-warning text-warning-foreground mx-auto w-fit">
								Most Popular
							</Badge>
							<CardTitle className="text-2xl">Monthly Plan</CardTitle>
							<div className="space-y-1">
								<div className="text-3xl font-bold text-primary">₦2,500</div>
								<p className="text-sm text-muted-foreground">per month</p>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{profile?.is_premium ? (
							<Button
								className="w-full bg-gradient-primary shadow-soft text-lg py-6"
								disabled
							>
								You are already a Premium User
							</Button>
						) : (
							<Button 
								onClick={handleGoToPremium}
								className="w-full bg-gradient-primary shadow-soft text-lg py-6"
								disabled={isLoading}
							>
								{isLoading ? "Processing..." : "Upgrade to Premium"}
							</Button>
						)}
					</CardContent>
				</Card>

				{/* Features List */}
				<Card className="shadow-card border-0">
					<CardHeader>
						<CardTitle>Premium Features</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{premiumFeatures.map((feature, index) => (
							<div key={index} className="flex items-start gap-3">
								<div className="p-2 bg-primary/10 rounded-lg shrink-0">
									<feature.icon className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1">
									<h4 className="font-medium">{feature.title}</h4>
									<p className="text-sm text-muted-foreground mt-1">
										{feature.description}
									</p>
								</div>
								{feature.included && (
									<Check className="h-5 w-5 text-success shrink-0 mt-1" />
								)}
							</div>
						))}
					</CardContent>
				</Card>

				{/* Testimonial */}
				<Card className="shadow-soft bg-accent/30 border-accent">
					<CardContent className="pt-6">
						<div className="text-center space-y-3">
							<div className="flex justify-center">
								{[...Array(5)].map((_, i) => (
									<div key={i} className="w-5 h-5 text-warning">⭐</div>
								))}
							</div>
							<blockquote className="text-sm italic">
								"MamaCare Premium gave me peace of mind throughout my pregnancy. 
								The AI symptom checker was incredibly helpful!"
							</blockquote>
							<p className="text-xs text-muted-foreground">- Sarah M., New Mom</p>
						</div>
					</CardContent>
				</Card>

				{/* Payment Info */}
				<Card className="shadow-soft">
					<CardContent className="pt-6">
						<div className="text-center space-y-2">
							<h4 className="font-medium">Secure Payment</h4>
							<p className="text-sm text-muted-foreground">
								Powered by Flutterwave • Cancel anytime
							</p>
							<div className="flex justify-center items-center gap-2 text-xs text-muted-foreground">
								<span>🔒 Encrypted</span>
								<span>•</span>
								<span>💳 All cards accepted</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};