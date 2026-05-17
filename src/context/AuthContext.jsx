import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'jsw@2024',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('jsw_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('jsw_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('jsw_user');
    }
  }, [user]);

  const login = (username, password) => {
    if (
      username === VALID_CREDENTIALS.username &&
      password === VALID_CREDENTIALS.password
    ) {
      const userData = { username, name: 'Admin User', role: 'Administrator' };
      setUser(userData);
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password' };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
