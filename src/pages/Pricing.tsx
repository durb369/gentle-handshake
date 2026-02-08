import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Stripe price IDs
const PRICE_IDS = {
  boosted: "price_1Sw30mPBmofuj4yB0BnawNLh",
  premium: "price_1SybjyPBmofuj4yBljJi2g3j",
};

interface PricingTier {
  name: string;
  price: string;
  priceId: string | null;
  description: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ReactNode;
  badge?: string;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    priceId: null,
    description: "Get started with spiritual scanning",
    icon: <Zap className="w-6 h-6" />,
    features: [
      "5 spirit scans total",
      "Basic entity detection",
      "Overall energy reading",
      "Standard imaging modes",
    ],
  },
  {
    name: "Boosted",
    price: "$1",
    priceId: PRICE_IDS.boosted,
    description: "Unlock the full spiritual experience",
    icon: <Crown className="w-6 h-6" />,
    highlighted: true,
    badge: "Most Popular",
    features: [
      "Unlimited spirit scans",
      "Full spiritual guidance",
      "Protection recommendations",
      "Entity sketch generation",
      "Sketch Gallery access",
      "Psychic Portal access",
      "Numerology Chart",
      "Daily Tarot Pull",
    ],
  },
  {
    name: "Premium",
    price: "$5",
    priceId: PRICE_IDS.premium,
    description: "For serious spiritual practitioners",
    icon: <Sparkles className="w-6 h-6" />,
    badge: "Best Value",
    features: [
      "Everything in Boosted",
      "Priority AI processing",
      "Advanced entity analysis",
      "Historical scan archive",
      "Exclusive ritual guides",
      "Priority support",
      "Early access to new features",
    ],
  },
];

const Pricing = () => {
  const { isBoosted, productId, startCheckout, openCustomerPortal, loading } = useSubscription();

  const handleSubscribe = useCallback(async (priceId: string) => {
    const url = await startCheckout(undefined, priceId);
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("Failed to start checkout. Please try again.");
    }
  }, [startCheckout]);

  const handleManageSubscription = useCallback(async () => {
    const url = await openCustomerPortal();
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("Failed to open subscription management. Please try again.");
    }
  }, [openCustomerPortal]);

  const isCurrentTier = (tier: PricingTier) => {
    if (!isBoosted && tier.priceId === null) return true;
    if (isBoosted && productId && tier.priceId) {
      // Check if current product matches this tier
      return productId === "prod_TwU2jrKEYGHtbG" && tier.name === "Boosted" ||
             productId === "prod_TwUjJXqRzU4Ub4" && tier.name === "Premium";
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-mystic-gradient relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Scanner
            </Link>
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
              Choose Your Path
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Unlock deeper spiritual insights and connect with the unseen realm
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <Card 
              key={tier.name}
              className={`relative flex flex-col ${
                tier.highlighted 
                  ? 'border-primary/50 bg-gradient-to-b from-primary/10 to-transparent shadow-lg shadow-primary/20' 
                  : 'border-border/50 bg-card/50 backdrop-blur-sm'
              }`}
            >
              {tier.badge && (
                <Badge 
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 ${
                    tier.highlighted ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                  }`}
                >
                  {tier.badge}
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-3 p-3 rounded-full ${
                  tier.highlighted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {tier.icon}
                </div>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.priceId && <span className="text-muted-foreground">/month</span>}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        tier.highlighted ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                {loading ? (
                  <Button className="w-full" disabled>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </Button>
                ) : isCurrentTier(tier) ? (
                  isBoosted ? (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={handleManageSubscription}
                    >
                      Manage Subscription
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  )
                ) : tier.priceId ? (
                  <Button 
                    className={`w-full ${tier.highlighted ? '' : ''}`}
                    variant={tier.highlighted ? "default" : "secondary"}
                    onClick={() => handleSubscribe(tier.priceId!)}
                  >
                    {isBoosted ? 'Upgrade' : 'Subscribe'}
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Questions?</h2>
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-lg bg-card/50 border border-border/50">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can manage or cancel your subscription at any time through the customer portal.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card/50 border border-border/50">
              <h3 className="font-semibold mb-2">What payment methods are accepted?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, debit cards, and digital wallets through Stripe.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card/50 border border-border/50">
              <h3 className="font-semibold mb-2">Can I upgrade or downgrade?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely! Use the "Manage Subscription" button to change your plan at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
