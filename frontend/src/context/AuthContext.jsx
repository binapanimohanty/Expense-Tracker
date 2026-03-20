import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { applyTheme, getSettings } from '../utils/preferences';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      applyTheme(getSettings().theme);

      const token = localStorage.getItem('token');
      const stored = localStorage.getItem('user');

      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem('user');
        }
      }

      if (token) {
        try {
          const response = await api.get('/users/me');
          localStorage.setItem('user', JSON.stringify(response.data));
          setUser(response.data);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    toast.success('Logged in successfully');
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    toast.success('Account created successfully');
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out');
  };

  const updateLocalProfile = (updates) => {
    setUser((current) => {
      if (!current) {
        return current;
      }

      const nextUser = {
        ...current,
        ...updates,
      };

      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
    toast.success('Profile preferences saved');
  };

  const updateProfile = async (updates) => {
    const response = await api.put('/users/me', updates);
    localStorage.setItem('user', JSON.stringify(response.data));
    setUser(response.data);
    toast.success('Profile updated');
    return response.data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    await api.put('/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    toast.success('Password updated');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        updateLocalProfile,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
