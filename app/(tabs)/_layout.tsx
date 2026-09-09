import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function TabsLayout() {
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  if (loading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.gray200,
          backgroundColor: COLORS.white,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          display: 'flex',
        },
      }}
    >
      {/* Always render both, but only show the one for the user */}
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          ),
          // Only show admin tab if user is admin
          href: isAdmin ? '/(tabs)/admin' : null,
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: 'Blogs',
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
          // Only show user tab if user is NOT admin
          href: !isAdmin ? '/(tabs)/user' : null,
        }}
      />
    </Tabs>
  );
}