'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/app/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user from sessionStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const savedUser = sessionStorage.getItem('user');

        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
          // Optional: Verify token with backend
          // await api.verifyToken(token);
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

  // Handle route protection
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

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      const { user: userPayload, token } = response.data;

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userPayload));
      setUser(userPayload);
      
      // Redirect after successful login
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
      
      // Redirect after successful signup
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
    // Force a full page reload to clear any state
    window.location.href = '/auth';
  };

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