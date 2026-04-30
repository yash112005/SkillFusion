import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AppleSignInButton = ({ role = 'candidate', onError }) => {
  const { signInWithApple } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);

      const AppleID = window.AppleID;
      if (!AppleID) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Apple Sign-In SDK'));
          document.head.appendChild(script);
        });
      }

      const clientId = import.meta.env.VITE_APPLE_CLIENT_ID;
      if (!clientId || clientId === 'com.example.web') {
        onError && onError('Apple Sign-In is not configured yet. Please set VITE_APPLE_CLIENT_ID in your .env file.');
        return;
      }

      window.AppleID.auth.init({
        clientId,
        scope: 'email name',
        redirectURI: window.location.origin,
        state: 'state',
        nonce: 'nonce',
        usePopup: true,
      });

      const response = await window.AppleID.auth.signIn();
      const { authorization, user } = response;
      await signInWithApple(authorization.id_token, user, role);
      navigate('/');
    } catch (err) {
      console.error('Apple Sign-In error:', err);
      if (err?.error === 'popup_closed_by_user') {
        onError && onError('Apple sign-in was canceled.');
      } else {
        onError && onError('Apple sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAppleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-900 dark:border-white rounded-lg bg-black text-white hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M16.365 21.43c-1.393.996-2.827.97-4.148.026-1.353-.97-2.618-.996-3.882-.026-1.36.965-2.628 1.094-3.791.228-3.08-2.316-5.834-8.082-3.896-12.784 1.15-2.8 3.593-4.161 5.67-4.254 1.808-.08 3.538 1.107 4.542 1.107 1.003 0 3.016-1.424 5.37-1.206 1.637.076 3.193.754 4.195 2.015-3.356 1.954-2.83 6.321.464 7.64-1.127 2.87-2.695 5.568-4.524 7.254z"/>
          <path d="M15.467 4.193c-.933 1.15-2.477 1.834-3.818 1.705.187-1.428.913-2.775 1.85-3.666 1.082-1.026 2.658-1.748 3.961-1.638-.13 1.503-.98 2.37-1.993 3.599z"/>
        </svg>
      )}
      Continue with Apple
    </button>
  );
};

export default AppleSignInButton;
