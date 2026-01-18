
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Basic resume building with essential features',
    features: [
      'Create up to 2 resumes',
      'Access to basic templates',
      'PDF downloads',
      'Email support'
    ],
    buttonText: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: 'per month',
    description: 'Advanced features for job seekers',
    features: [
      'Unlimited resumes',
      'Access to all templates',
      'PDF & DOCX downloads',
      'Remove watermark',
      'Priority support',
      'AI-powered suggestions'
    ],
    buttonText: 'Upgrade to Pro',
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$19.99',
    period: 'per month',
    description: 'For businesses and recruitment agencies',
    features: [
      'All Pro features',
      'Team collaboration',
      'Custom branding',
      'API access',
      'Advanced analytics',
      'Dedicated account manager'
    ],
    buttonText: 'Contact Sales',
    popular: false
  }
];

const Pricing = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your resume building needs. All plans include our core features to help you create stunning resumes.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className={`overflow-hidden flex flex-col ${plan.popular ? 'border-resume-primary shadow-lg relative' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-resume-primary text-white px-3 py-1 text-xs font-medium rounded-bl">
                  Most Popular
                </div>
              )}
              <CardHeader className={`${plan.popular ? 'bg-resume-accent' : ''}`}>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-resume-primary hover:bg-resume-secondary' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Need a custom solution? <Button variant="link" className="p-0 h-auto">Contact us</Button> for personalized pricing.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
