'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/app/lib/api';
import LoadingSpinner from '../components/auth/LoadingSpinner';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const savedUser = sessionStorage.getItem('user');

        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (loading) return;

    const token = sessionStorage.getItem('token');
    const isAuthPage = pathname.startsWith('/auth');
    const isProtectedPage = pathname.startsWith('/chat');

    if (!token && isProtectedPage) {
      router.replace('/auth');
      return;
    }

    if (token && isAuthPage) {
      router.replace('/chat');
      return;
    }
  }, [loading, pathname, router]);

  console.log("AuthContext loaded with user:", user);
  

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      const { user: userPayload, token } = response.data;

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userPayload));
      setUser(userPayload);
      
      router.replace('/chat');
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.register(userData);
      const { user: userPayload, token } = response.data;

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userPayload));
      setUser(userPayload);
      
      router.replace('/chat');
      return { success: true };
    } catch (error) {
      console.error("Signup failed:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    window.location.href = '/auth';
  };


  

  if (loading) {
      return <LoadingSpinner />;
    }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}