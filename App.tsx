import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/context/AuthContext';
import { BlogProvider } from '@/context/BlogContext';
import { Slot } from 'expo-router';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BlogProvider>
          <Slot />
        </BlogProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}