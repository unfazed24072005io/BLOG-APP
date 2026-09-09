import UserDashboard from '@/screens/UserDashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function UserScreen() {
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (isAdmin) {
        router.replace('/(tabs)/admin');
      }
    }
  }, [user, loading, isAdmin]);

  if (loading || !user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  );
}