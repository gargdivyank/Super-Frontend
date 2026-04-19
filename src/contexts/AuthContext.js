import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { resolveUserPermissions } from '../constants/permissions';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [initialized, setInitialized] = useState(false);

//   useEffect(() => {
//     // Check if user is already logged in
//     const token = localStorage.getItem('token');
//     const userData = localStorage.getItem('user');
    
//     if (token && userData) {
//       try {
//         setUser(JSON.parse(userData));
//         setIsAuthenticated(true);
//       } catch (error) {
//         console.error('Error parsing user data:', error);
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//       }
//     }
    
//     setLoading(false);
//   }, []);
export const AuthProvider = ({ children }) => {
  // user: object | null
  // isAuthenticated: boolean (true when user is authenticated)
  // loading: boolean for login/register/logout network operations
  // initialized: boolean -> true after we checked localStorage/token on mount
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const normalizeUser = (rawUser) => {
    if (!rawUser) return null;
    return {
      ...rawUser,
      permissions: resolveUserPermissions(rawUser),
    };
  };

  useEffect(() => {
    // On mount, try to restore token & validate it with server.
    const init = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token) {
        // No token stored -> finish initialization
        setInitialized(true);
        return;
      }

      try {
        // First, quickly restore user from localStorage for immediate UI update
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            const normalized = normalizeUser(parsedUser);
            setUser(normalized);
            setIsAuthenticated(true);
          } catch (err) {
            console.warn('Failed to parse saved user, will re-validate.', err);
            localStorage.removeItem('user');
          }
        }

        // Validate token with the server using the correct API method
        const res = await authAPI.getProfile();
        
        // Backend returns { success: true, data: user }
        const serverUser = res?.data?.data || res?.data || null;
        if (serverUser) {
          const normalized = normalizeUser(serverUser);
          setUser(normalized);
          setIsAuthenticated(true);
          // Keep localStorage in sync with server data
          localStorage.setItem('user', JSON.stringify(normalized));
        } else {
          // Server returned no user -> clear token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth validation failed on init:', error);
        // Invalid token or network error -> clear stored credentials
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setInitialized(true);
      }
    };

    init();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;
      const normalizedUser = normalizeUser(userData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      setUser(normalizedUser);
      setIsAuthenticated(true);
      
      return { success: true, user: normalizedUser };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    const normalized = normalizeUser(updatedUser);
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    initialized,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 