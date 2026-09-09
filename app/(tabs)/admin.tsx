import AdminDashboard from '@/screens/AdminDashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { COLORS } from '@/utils/constants';

export default function AdminScreen() {
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    console.log('AdminScreen - user:', user?.email, 'loading:', loading, 'isAdmin:', isAdmin);
    if (!loading) {
      if (!user) {
        console.log('No user, redirecting to login');
        router.replace('/login');
      } else if (!isAdmin) {
        console.log('Not admin, redirecting to user');
        router.replace('/(tabs)/user');
      }
    }
  }, [user, loading, isAdmin]);

  // If no user, show nothing while redirecting
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.gray500, fontFamily: 'Inter_400Regular' }}>Redirecting...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.gray500, fontFamily: 'Inter_400Regular' }}>Loading...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <Text style={{ color: COLORS.gray600, fontFamily: 'Inter_400Regular' }}>Access Denied</Text>
      </View>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <AdminDashboard />
    </ProtectedRoute>
  );
}