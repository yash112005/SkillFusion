import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  Clock, 
  History, 
  Download, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Package,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { motion } from 'framer-motion';

const BillingDashboard = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const [billingRes, invoiceRes] = await Promise.all([
          axios.get('/api/payment/billing-info', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/payment/invoices', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (billingRes.data.success) {
          setBillingData(billingRes.data);
        }
        if (invoiceRes.data.success) {
          setInvoices(invoiceRes.data.invoices);
        }
      } catch (err) {
        console.error('Error fetching billing data', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBillingData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { subscription, usage, plans } = billingData || {};
  const currentPlan = plans?.[user?.subscriptionPlan?.toUpperCase()] || plans?.FREE;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your plan, billing history, and usage.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Current Plan & Usage */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active Plan Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">
                    Current Plan
                  </span>
                  <h2 className="text-4xl font-extrabold mt-3 text-gray-900 dark:text-white">{user?.subscriptionPlan}</h2>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{currentPlan?.price}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                  <p className="text-sm text-gray-500 mt-1">Next billing: {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <button className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">
                  Change Plan
                </button>
                <button className="flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                  Cancel Subscription
                </button>
              </div>
            </motion.div>

            {/* Usage Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
                Usage Statistics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {usage?.map((item) => (
                  <div key={item.feature}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">{item.feature.replace('_', ' ')}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.count} / {item.limit}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((item.count / item.limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {(!usage || usage.length === 0) && (
                   <p className="text-gray-500 text-sm">No usage records found. Start using features to track progress.</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Payment History & Invoices */}
          <div className="space-y-8">
            
            {/* Quick Stats Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-lg">
              <Package className="w-8 h-8 mb-4 opacity-80" />
              <h4 className="text-lg opacity-80">Subscription Status</h4>
              <p className="text-2xl font-bold mt-1 flex items-center">
                {subscription?.status === 'active' ? (
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-300" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-300" />
                )}
                {subscription?.status || 'Inactive'}
              </p>
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm opacity-80">Member since</p>
                <p className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Invoices List */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900 dark:text-white">
                <Receipt className="w-5 h-5 mr-2 text-indigo-500" />
                Recent Invoices
              </h3>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice._id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">₹{invoice.amount}</span>
                      <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && (
                  <p className="text-center text-sm text-gray-500 py-4">No invoices yet.</p>
                )}
              </div>
              {invoices.length > 0 && (
                <button className="w-full mt-4 py-3 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-all flex items-center justify-center">
                  View All History
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;
