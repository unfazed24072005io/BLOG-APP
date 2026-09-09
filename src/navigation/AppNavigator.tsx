import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import LoginScreen from '@/screens/LoginScreen';
import AdminDashboard from '@/screens/AdminDashboard';
import UserDashboard from '@/screens/UserDashboard';
import CreateBlogScreen from '@/screens/CreateBlogScreen';
import BlogDetailScreen from '@/screens/BlogDetailScreen';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { COLORS } from '@/utils/constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AdminTabs() {
  return (
    <Tab.Navigator
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
        },
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CreateBlog"
        component={CreateBlogScreen}
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => (
            <Feather name="plus-circle" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function UserTabs() {
  return (
    <Tab.Navigator
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
        },
      }}
    >
      <Tab.Screen
        name="UserDashboard"
        component={UserDashboard}
        options={{
          title: 'Blogs',
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main">
              {() => (
                <ProtectedRoute adminOnly={isAdmin}>
                  {isAdmin ? <AdminTabs /> : <UserTabs />}
                </ProtectedRoute>
              )}
            </Stack.Screen>
            <Stack.Screen name="CreateBlog" component={CreateBlogScreen} />
            <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}