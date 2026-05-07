import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User as UserIcon, Mail, Lock, CheckCircle, AlertCircle, Loader2, Crown, TrendingUp } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear alerts on type
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const updatePayload = {
        name: formData.name,
        email: formData.email
      };
      
      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const res = await axios.put('/api/auth/me', updatePayload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      updateUser(res.data);
      setMessage("Profile updated successfully!");
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header Section */}
        <div className="text-center">
          <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-dark-card shadow-lg">
            <span className="text-4xl font-black">{user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-10 h-10" />}</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Your Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account settings and information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Account Details Form */}
          <div className="md:col-span-2">
            <div className="card p-8 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 shadow-xl rounded-2xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Personal Information</h2>
              
              {message && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">{message}</span>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl flex items-center">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-field pl-11"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-field pl-11"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {user.authProvider === 'local' && (
                  <>
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-6">
                      <h3 className="text-md font-bold text-gray-900 dark:text-white mb-4">Change Password</h3>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">New Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              className="input-field pl-11"
                              placeholder="Leave blank to keep current"
                              minLength="6"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Confirm New Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className="input-field pl-11"
                              placeholder="Confirm new password"
                              minLength="6"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 text-lg flex justify-center items-center mt-8"
                >
                  {loading ? (
                    <><Loader2 className="w-6 h-6 animate-spin mr-2" /> Saving Changes...</>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Account Status Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="card p-6 bg-gradient-to-br from-primary-600 to-indigo-600 text-white rounded-2xl shadow-xl border-none">
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-6 flex items-center">
                <Crown className="w-4 h-4 mr-2" /> Subscription Plan
              </h3>
              <div className="text-4xl font-black mb-2">{user.subscriptionPlan || 'Free'}</div>
              <p className="text-sm opacity-90 mb-6">Current active plan</p>
              
              {user.subscriptionPlan !== 'Pro' && (
                <a href="/pricing" className="block text-center w-full py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                  Upgrade to Pro
                </a>
              )}
            </div>

            <div className="card p-6 bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" /> Account Activity
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Role</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">{user.role}</div>
                </div>
                
                {user.role === 'candidate' && (
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">AI Matches Used</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{user.usage_count || 0}</div>
                  </div>
                )}
                
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sign-in Method</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                    {user.authProvider || 'Email'}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
