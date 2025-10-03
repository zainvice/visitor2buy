import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Star, Zap, Shield, Users, BarChart3, Globe } from 'lucide-react';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for getting started',
      features: [
        '3 widgets',
        '1 project',
        '1,000 page views/month',
        'Basic analytics',
        'Email support',
        'Visitor2Buy branding'
      ],
      limitations: [
        'Limited customization',
        'No A/B testing',
        'No priority support'
      ],
      cta: 'Get Started Free',
      ctaLink: '/register',
      popular: false,
      color: 'gray'
    },
    {
      name: 'Pro',
      price: { monthly: 29, annual: 290 },
      description: 'For growing businesses',
      features: [
        'Unlimited widgets',
        'Unlimited projects',
        'Unlimited page views',
        'Advanced analytics',
        'Priority support',
        'Remove branding',
        'A/B testing',
        'Advanced targeting',
        'Custom CSS',
        'Export data',
        'Team collaboration',
        'API access'
      ],
      limitations: [],
      cta: 'Start Free Trial',
      ctaLink: '/register',
      popular: true,
      color: 'blue'
    }
  ];

  const faqs = [
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
    },
    {
      question: 'What happens if I exceed my limits?',
      answer: 'On the Free plan, widgets will stop showing once you reach your limits. Pro plan has no limits.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans.'
    },
    {
      question: 'Can I use my own domain?',
      answer: 'Yes, you can use widgets on any domain you own. Pro plan supports unlimited domains.'
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No, there are no setup fees or hidden costs. You only pay the monthly or annual subscription.'
    },
    {
      question: 'Do you provide support?',
      answer: 'Yes, we provide email support for all plans and priority support for Pro subscribers.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Marketing Director',
      company: 'TechStart',
      content: 'ROI was positive within the first week. The targeting features are incredible.',
      rating: 5
    },
    {
      name: 'Mike Johnson',
      role: 'E-commerce Owner',
      company: 'RetailPro',
      content: 'Increased our email signups by 300%. Best investment we\'ve made.',
      rating: 5
    },
    {
      name: 'Lisa Rodriguez',
      role: 'Growth Lead',
      company: 'SaaS Co',
      content: 'Easy to use and powerful. Our conversion rate improved dramatically.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                <span className="text-lg font-bold text-white">V2B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Visitor2Buy</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Start free, upgrade when you need more. No hidden fees, no surprises.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-12">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`mx-3 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isAnnual ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isAnnual ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Annual
              </span>
              {isAnnual && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Save 17%
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative rounded-2xl border-2 p-8 shadow-lg ${
                  plan.popular
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                      <Star className="h-4 w-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">
                      ${isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-xl text-gray-500 ml-1">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  
                  {isAnnual && plan.price.monthly > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      ${(plan.price.annual / 12).toFixed(0)}/month billed annually
                    </p>
                  )}
                </div>

                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                    What's Included
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <>
                      <h4 className="text-sm font-semibold text-gray-900 mb-4 mt-6 uppercase tracking-wide">
                        Limitations
                      </h4>
                      <ul className="space-y-3">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="flex items-start">
                            <X className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-500">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <Link
                  to={plan.ctaLink}
                  className={`block w-full text-center px-6 py-3 border border-transparent text-base font-medium rounded-lg transition-colors ${
                    plan.popular
                      ? 'text-white bg-blue-600 hover:bg-blue-700'
                      : 'text-blue-600 bg-white border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compare Plans
            </h2>
            <p className="text-xl text-gray-600">
              See what's included in each plan
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 gap-px bg-gray-200">
              <div className="bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900">Features</h3>
              </div>
              <div className="bg-white p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Free</h3>
              </div>
              <div className="bg-blue-50 p-6 text-center">
                <h3 className="text-lg font-semibold text-blue-900">Pro</h3>
              </div>
            </div>

            {[
              { feature: 'Number of widgets', free: '3', pro: 'Unlimited' },
              { feature: 'Number of projects', free: '1', pro: 'Unlimited' },
              { feature: 'Page views per month', free: '1,000', pro: 'Unlimited' },
              { feature: 'Analytics & reporting', free: 'Basic', pro: 'Advanced' },
              { feature: 'A/B testing', free: false, pro: true },
              { feature: 'Remove branding', free: false, pro: true },
              { feature: 'Custom CSS', free: false, pro: true },
              { feature: 'Priority support', free: false, pro: true },
              { feature: 'API access', free: false, pro: true }
            ].map((row, index) => (
              <div key={index} className="grid grid-cols-3 gap-px bg-gray-200">
                <div className="bg-white p-4">
                  <span className="text-gray-900">{row.feature}</span>
                </div>
                <div className="bg-white p-4 text-center">
                  {typeof row.free === 'boolean' ? (
                    row.free ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    )
                  ) : (
                    <span className="text-gray-700">{row.free}</span>
                  )}
                </div>
                <div className="bg-blue-50 p-4 text-center">
                  {typeof row.pro === 'boolean' ? (
                    row.pro ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    )
                  ) : (
                    <span className="text-blue-900 font-medium">{row.pro}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of happy customers
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start your free trial today. No credit card required.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all"
            >
              Start Free Trial
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link to="/" className="inline-flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <span className="text-sm font-bold text-white">V2B</span>
            </div>
            <span className="font-bold">Visitor2Buy</span>
          </Link>
          <p className="text-gray-400 text-sm">
            &copy; 2024 Visitor2Buy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;