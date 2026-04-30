import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planName) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (planName === 'Free') {
      navigate('/dashboard/candidate');
      return;
    }

    setLoading(true);
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert('Razorpay SDK failed to load. Please check your connection.');
        return;
      }

      const res = await axios.post('/api/payment/create-order', { plan: planName }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const options = {
        key: 'rzp_test_mock_key_id',
        amount: res.data.amount,
        currency: res.data.currency,
        name: 'SkillFusion',
        description: `${planName} Plan Subscription`,
        order_id: res.data.orderId,
        handler: function (response) {
          navigate(`/payment-success?payment_id=${response.razorpay_payment_id}`);
        },
        prefill: {
          name: user.name || 'SkillFusion User',
          email: user.email || '',
        },
        theme: {
          color: '#6366f1',
        },
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
      });
      
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert('Error initiating checkout. Please make sure Razorpay keys are configured in backend.');
    } finally {
      setLoading(false);
    }
  };

  const tiers = [
    {
      name: 'Free',
      price: '₹0',
      description: 'Basic resume matching for everyone.',
      features: ['5 Matches per month', 'Basic match score', 'Standard support'],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '₹299',
      period: '/mo',
      description: 'Advanced analytics for serious candidates.',
      features: ['Unlimited matches', 'Detailed AI suggestions', 'ATS Keyword Analysis', 'Priority support'],
      cta: 'Subscribe Pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '₹999',
      period: '/mo',
      description: 'Tools for recruiters and hiring managers.',
      features: ['Everything in Pro', 'Recruiter Dashboard', 'Bulk JD uploads', 'Export analytics reports'],
      cta: 'Subscribe Enterprise',
      popular: false
    }
  ];

  return (
    <div className="py-20 bg-gray-50 dark:bg-dark-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Choose the plan that best fits your career or hiring goals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div key={tier.name} className={`card relative ${tier.popular ? 'border-2 border-primary-500 transform scale-105 shadow-2xl z-10' : ''}`}>
              {tier.popular && (
                <div className="absolute top-0 inset-x-0 -mt-4 flex justify-center">
                  <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-semibold mb-2">{tier.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 h-12">{tier.description}</p>
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-extrabold">{tier.price}</span>
                  {tier.period && <span className="text-xl text-gray-500 ml-2">{tier.period}</span>}
                </div>
                <button 
                  onClick={() => handleSubscribe(tier.name)}
                  disabled={loading}
                  className={`w-full py-4 rounded-full font-bold transition-all ${
                    tier.popular 
                      ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg' 
                      : 'bg-indigo-50 text-indigo-700 dark:bg-gray-800 dark:text-white hover:bg-indigo-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {loading ? 'Processing...' : tier.cta}
                </button>
              </div>
              <div className="px-8 pb-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <ul className="space-y-4">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="flex-shrink-0 w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
