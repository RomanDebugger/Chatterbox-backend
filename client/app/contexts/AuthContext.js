// contexts/AuthContext.js
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import { initializeSocket, getSocket } from '@/app/lib/socket';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
const savedUser = localStorage.getItem('user');
if (token && savedUser) {

  setUser(JSON.parse(savedUser));
}
    setLoading(false);
  }, []);



  const login = async (credentials) => {
    try {
      const { user: userPayload, token } = await api.login(credentials);
      
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      
      setUser(userPayload); 
      localStorage.setItem('user', JSON.stringify(userPayload));
      initializeSocket(token); 
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

 const signup = async (userData) => {
  try {
    const { user, token } = await api.register(userData);

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }

    setUser(user);
    initializeSocket(token);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const socket = getSocket();
    if (socket) {
      socket.disconnect();
    }
    
    setUser(null);
    router.push('/auth');
  };

  useEffect(() => {
  const handleForceLogout = () => {
    logout();
    router.push('/auth');
  };

  window.addEventListener('force-logout', handleForceLogout);

  return () => {
    window.removeEventListener('force-logout', handleForceLogout);
  };
}, [logout, router]);

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