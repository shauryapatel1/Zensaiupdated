import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { ErrorCode, createAppError, getUserFriendlyErrorMessage } from '../types/errors';

interface User {
  id: string;
  name: string;
  email: string;
  joinedDate: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          // Handle "Auth session missing!" as a normal unauthenticated state
          if (error.message === 'Auth session missing!') {
            console.warn('No active session found - user is not authenticated');
          } else if (error.message.includes('Invalid Refresh Token')) {
            console.warn('Invalid refresh token found - clearing session');
            // Clear the invalid session from local storage
            await supabase.auth.signOut();
          } else {
            console.error('Error getting initial session:', error);
          }
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        if (user) {
          const userData = mapSupabaseUserToUser(user);
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = mapSupabaseUserToUser(session.user);
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const mapSupabaseUserToUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      joinedDate: new Date(supabaseUser.created_at)
    };
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        let errorMessage = 'Login failed. Please try again.';
        let errorCode = ErrorCode.UNKNOWN_ERROR;
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
          errorCode = ErrorCode.AUTH_INVALID_CREDENTIALS;
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account before signing in.';
          errorCode = ErrorCode.AUTH_USER_NOT_FOUND;
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment and try again.';
          errorCode = ErrorCode.AUTH_TOO_MANY_REQUESTS;
        }
        
        const appError = createAppError(errorCode, errorMessage, { originalMessage: error.message });
        return { success: false, error: getUserFriendlyErrorMessage(appError) };
      }

      if (data.user) {
        // User state will be updated by the auth state change listener
        return { success: true };
      }

      return { success: false, error: 'Login failed. Please try again.' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: getUserFriendlyErrorMessage(createAppError(ErrorCode.UNKNOWN_ERROR, 'An unexpected error occurred. Please try again.', undefined, error)) };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });
      
      if (error) {
        let errorMessage = 'Sign up failed. Please try again.';
        let errorCode = ErrorCode.UNKNOWN_ERROR;
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
          errorCode = ErrorCode.AUTH_EMAIL_IN_USE;
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
          errorCode = ErrorCode.AUTH_WEAK_PASSWORD;
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
          errorCode = ErrorCode.AUTH_INVALID_EMAIL;
        }
        
        const appError = createAppError(errorCode, errorMessage, { originalMessage: error.message });
        return { success: false, error: getUserFriendlyErrorMessage(appError) };
      }

      if (data.user) {
        // Check if email confirmation is required
        // Check if email confirmation is required
        if (!data.session) {
          return { 
            success: true, 
            error: 'Please check your email and click the confirmation link to complete your registration.' 
          };
        }
        
        // User state will be updated by the auth state change listener
        return { success: true };
      }

      return { success: false, error: 'Sign up failed. Please try again.' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: getUserFriendlyErrorMessage(createAppError(ErrorCode.UNKNOWN_ERROR, 'An unexpected error occurred. Please try again.', undefined, error)) };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      // User state will be updated by the auth state change listener
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      signup
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}