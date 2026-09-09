import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/utils/constants';

export default function Index() {
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    console.log('Index page - user:', user?.email, 'loading:', loading, 'isAdmin:', isAdmin);
    if (!loading) {
      if (user) {
        if (isAdmin) {
          console.log('Redirecting to admin dashboard');
          router.replace('/(tabs)/admin');
        } else {
          console.log('Redirecting to user dashboard');
          router.replace('/(tabs)/user');
        }
      } else {
        console.log('Redirecting to login');
        router.replace('/login');
      }
    }
  }, [user, loading, isAdmin]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={{ marginTop: 16, color: COLORS.gray500, fontFamily: 'Inter_400Regular' }}>Loading...</Text>
    </View>
  );
}