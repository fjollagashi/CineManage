import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = (email, password) =>
    authApi.login(email, password).then(({ user, token }) => {
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    });

  const register = (body) =>
    authApi.register(body).then(({ user, token }) => {
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    });

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const role = (user?.role || '').toUpperCase();
  const isAdmin = role === 'ADMIN';
  const isEmployee = role === 'EMPLOYEE' || isAdmin;
  const isCustomer = role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isEmployee,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
