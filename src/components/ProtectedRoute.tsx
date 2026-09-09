import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/utils/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.gray500 }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20 }}>
        <Text style={{ fontSize: 18, color: COLORS.gray700, textAlign: 'center' }}>
          Please login to access this page
        </Text>
      </View>
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20 }}>
        <Text style={{ fontSize: 18, color: COLORS.error, textAlign: 'center' }}>
          Access Denied
        </Text>
        <Text style={{ fontSize: 14, color: COLORS.gray500, textAlign: 'center', marginTop: 8 }}>
          You need admin privileges to access this page
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};