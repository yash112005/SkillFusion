import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await forgotPassword(email);
      setMessage('Password reset link has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 py-12">
      <div className="card max-w-md w-full animate-slide-up">
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>

        <h2 className="text-3xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
          Forgot Password?
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 flex items-start gap-3 text-sm border border-red-100 dark:border-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-lg mb-6 flex items-start gap-3 text-sm border border-green-100 dark:border-green-800">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{message}</p>
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 flex justify-center items-center">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Remembered your password? <Link to="/login" className="text-primary-600 hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
