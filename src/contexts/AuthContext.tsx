import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setAuthToken, removeAuthToken, setUser, getUser, LoginRequest, SignupRequest, JwtResponse } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = getUser();
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUserState(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response: JwtResponse = await authApi.login(credentials);
      
      setAuthToken(response.token);
      const userData = {
        id: response.id,
        username: response.username,
        email: response.email,
        roles: response.roles,
      };
      setUser(userData);
      setUserState(userData);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.username}!`,
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (data: SignupRequest) => {
    try {
      await authApi.signup(data);
      
      toast({
        title: "Registration successful",
        description: "You can now log in with your credentials.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUserState(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
