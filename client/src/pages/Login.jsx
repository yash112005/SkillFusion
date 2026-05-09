import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import AppleSignInButton from '../components/auth/AppleSignInButton';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialError = (errMessage) => {
    setError(errMessage);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 py-12">
      <div className="card max-w-md w-full animate-slide-up">
        <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
          Welcome Back
        </h2>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 flex items-start gap-3 text-sm border border-red-100 dark:border-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <div className="flex items-center justify-end">
            <Link 
              to="/forgot-password" 
              className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 flex justify-center items-center">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white dark:bg-dark-card text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <GoogleSignInButton onError={handleSocialError} />
          <AppleSignInButton onError={handleSocialError} />
        </div>

        <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
          Don't have an account? <Link to="/signup" className="text-primary-600 hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
