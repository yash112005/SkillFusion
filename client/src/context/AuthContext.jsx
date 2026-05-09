import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser({ ...res.data, token });
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setUser(res.data);
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      throw err;
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const res = await axios.post('/api/auth/signup', { name, email, password, role });
      setUser(res.data);
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const signInWithGoogle = async (token, role) => {
    try {
      console.log('1. Sending token to backend...');
      const res = await axios.post('/api/auth/google', { token, role });
      console.log('2. Response received:', res.data);
      setUser(res.data);
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      console.error('3. Google Sign-In Error:', err.response?.data || err.message);
      throw err;
    }
  };

  const signInWithApple = async (identityToken, userData, role) => {
    try {
      const res = await axios.post('/api/auth/apple', { identityToken, userData, role });
      setUser(res.data);
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      console.error('Apple Sign-In Error:', err.response?.data || err.message);
      throw err;
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    if (updatedUserData.token) {
      localStorage.setItem('token', updatedUserData.token);
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/auth/forgotpassword', { email });
    } catch (err) {
      console.error('Forgot password error:', err.response?.data || err.message);
      throw err;
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      const res = await axios.put(`/api/auth/resetpassword/${resetToken}`, { password });
      setUser(res.data);
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      console.error('Reset password error:', err.response?.data || err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, signInWithGoogle, signInWithApple, updateUser, forgotPassword, resetPassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};