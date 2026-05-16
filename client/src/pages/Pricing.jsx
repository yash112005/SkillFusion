import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Pricing = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  const plans = [
    {
      name: 'Free',
      icon: <Zap className="w-6 h-6 text-gray-400" />,
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started with your career journey.',
      features: [
        '5 AI Matches per month',
        '10 Resume Scans',
        '1 Portfolio Build',
        '2 Mock Interviews',
        'Standard Community Support'
      ],
      cta: 'Current Plan',
      popular: false,
      color: 'gray'
    },
    {
      name: 'Pro',
      icon: <Crown className="w-6 h-6 text-indigo-500" />,
      price: { monthly: 299, yearly: 2990 },
      description: 'Unlock full potential with advanced AI tools.',
      features: [
        '100 AI Matches per month',
        '200 Resume Scans',
        '10 Portfolio Builds',
        '20 Mock Interviews',
        'ATS Keyword Optimization',
        'Priority Support'
      ],
      cta: 'Upgrade to Pro',
      popular: true,
      color: 'indigo'
    },
    {
      name: 'Enterprise',
      icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
      price: { monthly: 999, yearly: 9990 },
      description: 'The ultimate toolset for professionals & teams.',
      features: [
        '1000 AI Matches per month',
        '2000 Resume Scans',
        '100 Portfolio Builds',
        '200 Mock Interviews',
        'Custom Portfolio Branding',
        'Bulk Match Analytics',
        'Dedicated Manager'
      ],
      cta: 'Get Enterprise',
      popular: false,
      color: 'purple'
    }
  ];

  const handleSubscribe = async (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (plan.name === user.subscriptionPlan) {
      return;
    }

    if (plan.name === 'Free') {
      return;
    }

    setLoadingPlan(plan.name);
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert('Razorpay SDK failed to load. Please check your connection.');
        return;
      }

      const res = await axios.post('/api/payment/create-order', { 
        plan: plan.name,
        interval: billingCycle === 'yearly' ? 'year' : 'month'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const options = {
        key: res.data.keyId,
        amount: res.data.amount,
        currency: res.data.currency,
        name: 'SkillFusion',
        description: `${plan.name} Plan Subscription`,
        order_id: res.data.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (verifyRes.data.success) {
              navigate('/dashboard/candidate?payment=success');
              // Optionally trigger a user profile refresh here
            }
          } catch (err) {
            console.error('Verification failed', err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#6366f1',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert('Error initiating checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg dark:to-dark-bg/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-indigo-600 font-bold tracking-wide uppercase text-sm mb-4"
          >
            Pricing Plans
          </motion.h2>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6"
          >
            Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">career growth</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Scale your job search and recruitment with AI-powered tools. Choose a plan that fits your needs.
          </motion.p>

          {/* Toggle */}
          <div className="mt-10 flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 bg-indigo-100 dark:bg-gray-800 rounded-full transition-colors focus:outline-none"
            >
              <motion.div 
                animate={{ x: billingCycle === 'monthly' ? 4 : 32 }}
                className="absolute top-1 w-5 h-5 bg-indigo-600 rounded-full"
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Yearly <span className="text-green-500 font-bold ml-1">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (idx + 1) }}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                plan.popular 
                ? 'bg-white dark:bg-gray-900 shadow-2xl ring-2 ring-indigo-500 scale-105 z-10' 
                : 'bg-white/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -mt-4 mr-8">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-8">
                <div className={`p-3 rounded-2xl bg-${plan.color}-50 dark:bg-${plan.color}-900/30`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    ₹{billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                  </span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm h-10">
                  {plan.description}
                </p>
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loadingPlan === plan.name || user?.subscriptionPlan === plan.name}
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 ${
                  user?.subscriptionPlan === plan.name
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                  : plan.popular
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none'
                  : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:bg-transparent dark:text-indigo-400 dark:hover:bg-indigo-900/20'
                }`}
              >
                {loadingPlan === plan.name ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : user?.subscriptionPlan === plan.name ? (
                  'Current Plan'
                ) : (
                  <>
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-10 space-y-4">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start">
                    <div className="mt-1 flex-shrink-0">
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-indigo-500' : 'text-green-500'}`} />
                    </div>
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Preview or Trust Section */}
        <div className="mt-24 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            All plans include SSL security and 24/7 support. 
            <br />
            Need a custom enterprise plan? <a href="/contact" className="text-indigo-600 font-semibold hover:underline">Contact sales</a>
          </p>
          <div className="mt-8 flex justify-center space-x-8 opacity-50 grayscale">
            {/* Mock Logos */}
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
