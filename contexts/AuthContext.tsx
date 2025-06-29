import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useUserRole, UserRole } from './UserContext';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUserRole, setUserName } = useUserRole();

  // Function to determine user role based on email or metadata
  const determineUserRole = (user: User): UserRole => {
    // Check user metadata first
    if (user.user_metadata?.role) {
      return user.user_metadata.role as UserRole;
    }

    // Check email patterns for demo purposes
    const email = user.email?.toLowerCase() || '';
    
    if (email.includes('trainer') || email.includes('coach')) {
      return 'trainer';
    } else if (email.includes('nutritionist') || email.includes('nutrition')) {
      return 'nutritionist';
    } else if (email.includes('admin')) {
      return 'admin';
    } else if (email.includes('hr')) {
      return 'hr';
    } else {
      // Default to client
      return 'client';
    }
  };

  // Function to set user data when authenticated
  const setUserData = (user: User | null) => {
    if (user) {
      // Determine and set user role
      const role = determineUserRole(user);
      setUserRole(role);
      
      // Set user name
      const name = user.user_metadata?.full_name || 
                   user.user_metadata?.first_name || 
                   user.email?.split('@')[0] || 
                   'User';
      setUserName(name);
      
      console.log('User authenticated:', {
        email: user.email,
        role,
        name
      });
    } else {
      // Clear user data
      setUserRole(null);
      setUserName('User');
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setUserData(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setUserData(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...userData,
          role: userData?.role || 'client', // Default to client role
        },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      // Clear user data on sign out
      setUserData(null);
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
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