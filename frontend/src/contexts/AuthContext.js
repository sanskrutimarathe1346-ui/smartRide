import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import axios from 'axios'; // ✅ REQUIRED
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔐 Auto-login (persist session)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (!token || !savedUser) {
          setLoading(false);
          return;
        }

        // ✅ SET TOKEN GLOBALLY
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Restore user
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);

        // Verify token
        const res = await authAPI.getProfile();

        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));

      } catch (error) {
        console.error("Auth verification failed:", error);

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 🔑 LOGIN
  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // ✅ SAVE
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ SET TOKEN GLOBALLY
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // ✅ UPDATE STATE
      setUser(user);
      setIsAuthenticated(true);

      toast.success("Login successful");

      return { success: true };

    } catch (error) {
      console.error(error);
      toast.error("Login failed");
      return { success: false };
    }
  };

  // 📝 REGISTER
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // ✅ SET TOKEN GLOBALLY
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
      setIsAuthenticated(true);

      toast.success('Registration successful!');
      return { success: true, user };

    } catch (error) {
      const message = error.response?.data?.msg || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    delete axios.defaults.headers.common['Authorization']; // ✅ CLEAN HEADER

    setUser(null);
    setIsAuthenticated(false);

    toast.success('Logged out successfully');
  };

  // 🔄 UPDATE USER
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};