import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Supabase configuration - using demo/mock values for development
const supabaseUrl = 'https://demo.supabase.co';
const supabaseAnonKey = 'demo-anon-key';

// Custom storage adapter for different platforms
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      // Use AsyncStorage for web
      return AsyncStorage.getItem(key);
    } else {
      // Use SecureStore for mobile
      return SecureStore.getItemAsync(key);
    }
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      // Use AsyncStorage for web
      return AsyncStorage.setItem(key, value);
    } else {
      // Use SecureStore for mobile
      return SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      // Use AsyncStorage for web
      return AsyncStorage.removeItem(key);
    } else {
      // Use SecureStore for mobile
      return SecureStore.deleteItemAsync(key);
    }
  },
};

// Mock Supabase client for demo purposes
const createMockSupabaseClient = () => {
  const mockUsers = new Map();
  let currentUser: any = null;
  let currentSession: any = null;
  const authListeners: any[] = [];

  return {
    auth: {
      getSession: async () => {
        return { data: { session: currentSession }, error: null };
      },
      
      signUp: async ({ email, password, options }: any) => {
        // Simulate sign up
        const user = {
          id: Math.random().toString(36),
          email,
          user_metadata: options?.data || {},
          created_at: new Date().toISOString(),
        };
        
        mockUsers.set(email, { ...user, password });
        currentUser = user;
        currentSession = {
          user,
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
        };
        
        // Notify listeners
        authListeners.forEach(listener => {
          listener('SIGNED_IN', currentSession);
        });
        
        return { data: { user, session: currentSession }, error: null };
      },
      
      signInWithPassword: async ({ email, password }: any) => {
        // Simulate sign in
        const storedUser = mockUsers.get(email);
        
        if (!storedUser || storedUser.password !== password) {
          return { 
            data: { user: null, session: null }, 
            error: { message: 'Invalid login credentials' } 
          };
        }
        
        currentUser = storedUser;
        currentSession = {
          user: storedUser,
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
        };
        
        // Notify listeners
        authListeners.forEach(listener => {
          listener('SIGNED_IN', currentSession);
        });
        
        return { data: { user: currentUser, session: currentSession }, error: null };
      },
      
      signOut: async () => {
        currentUser = null;
        currentSession = null;
        
        // Notify listeners
        authListeners.forEach(listener => {
          listener('SIGNED_OUT', null);
        });
        
        return { error: null };
      },
      
      resetPasswordForEmail: async (email: string) => {
        // Simulate password reset
        return { data: {}, error: null };
      },
      
      updateUser: async (updates: any) => {
        if (currentUser) {
          currentUser = { ...currentUser, ...updates };
          currentSession = { ...currentSession, user: currentUser };
        }
        return { data: { user: currentUser }, error: null };
      },
      
      getUser: async () => {
        return { data: { user: currentUser }, error: null };
      },
      
      onAuthStateChange: (callback: any) => {
        authListeners.push(callback);
        
        // Immediately call with current state
        if (currentSession) {
          setTimeout(() => callback('SIGNED_IN', currentSession), 0);
        }
        
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const index = authListeners.indexOf(callback);
                if (index > -1) {
                  authListeners.splice(index, 1);
                }
              }
            }
          }
        };
      },
    }
  };
};

export const supabase = createMockSupabaseClient() as any;

// Auth helper functions
export const signUp = async (email: string, password: string, userData?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
};

export const updateProfile = async (updates: any) => {
  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  });
  return { data, error };
};