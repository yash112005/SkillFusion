import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 py-12">
      <div className="card max-w-md w-full animate-slide-up">
        <h2 className="text-3xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
          Set New Password
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Please enter your new password below.
        </p>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 flex items-start gap-3 text-sm border border-red-100 dark:border-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-lg mb-6 flex items-start gap-3 text-sm border border-green-100 dark:border-green-800">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Password Reset Successful!</p>
              <p className="text-xs mt-1">You are being logged in and redirected...</p>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  className="input-field pl-10" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  className="input-field pl-10" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 flex justify-center items-center">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
