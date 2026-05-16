import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Search,
  Filter,
  MoreVertical,
  Download,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'framer-motion';

const AdminBilling = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/payment/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin billing data', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = [
    { name: 'Total Revenue', value: `₹${data?.totalRevenue?.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Active Subs', value: data?.activeSubscriptions, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'MRR (Estimate)', value: `₹${Math.round(data?.totalRevenue / 6 || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Failed Payments', value: '2', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const chartData = data?.monthlyRevenue?.map(item => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][item._id - 1],
    revenue: item.revenue
  })) || [];

  return (
    <div className="p-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Revenue Analytics</h1>
            <p className="text-gray-500 mt-1">Real-time financial performance of SkillFusion.</p>
          </div>
          <button className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-green-500 flex items-center">
                  +12.5% <TrendingUp className="w-3 h-3 ml-1" />
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-4">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Growth</h3>
              <select className="bg-gray-50 dark:bg-gray-800 border-none text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-0">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Recent Transactions</h3>
            <div className="space-y-6">
              {data?.recentPayments?.map((payment) => (
                <div key={payment._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500">
                      {payment.userId?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{payment.userId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">₹{payment.amount}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${payment.status === 'captured' ? 'text-green-500' : 'text-red-500'}`}>
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))}
              {(!data?.recentPayments || data.recentPayments.length === 0) && (
                <p className="text-center text-sm text-gray-500 py-10">No transactions yet.</p>
              )}
            </div>
            <button className="w-full mt-8 py-3 text-sm font-bold text-indigo-600 border border-indigo-100 rounded-2xl hover:bg-indigo-50 transition-all">
              View All Transactions
            </button>
          </motion.div>

        </div>

        {/* Failed Webhooks / System Health */}
        <div className="mt-10 bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/30 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-400">System Alert: 2 Webhooks Failed</p>
              <p className="text-xs text-red-600 dark:text-red-500 opacity-80">Razorpay events for 'subscription.charged' failed to process in the last 24h.</p>
            </div>
          </div>
          <button className="text-xs font-bold text-red-700 dark:text-red-400 underline">Resolve Now</button>
        </div>

      </div>
    </div>
  );
};

export default AdminBilling;
