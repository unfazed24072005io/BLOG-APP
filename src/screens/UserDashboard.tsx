import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useBlog } from '@/context/BlogContext';
import { useAuth } from '@/context/AuthContext';
import { BlogCard } from '@/components/BlogCard';
import { COLORS } from '@/utils/constants';

export default function UserDashboard() {
  const insets = useSafeAreaInsets();
  const { blogs, loading, refreshBlogs } = useBlog();
  const { logout, userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshBlogs();
    setRefreshing(false);
  }, [refreshBlogs]);

  const handleLogout = async () => {
    console.log('🚪 Logout button pressed');
    console.log('Current user:', userProfile?.email || 'No user');
    
    try {
      console.log('📡 Calling logout...');
      await logout();
      console.log('✅ Logout successful, redirecting...');
      router.replace('/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Blogs</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back, {userProfile?.displayName || 'User'}
          </Text>
        </View>
        <Pressable 
          onPress={handleLogout} 
          style={({ pressed }) => [
            styles.logoutBtn,
            { 
              opacity: pressed ? 0.7 : 1, 
              transform: [{ scale: pressed ? 0.95 : 1 }] 
            }
          ]}
        >
          <Feather name="log-out" size={24} color="#EF4444" />
        </Pressable>
      </View>

      {/* Blog List */}
      <FlatList
        data={blogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BlogCard
            blog={item}
            onPress={() => router.push(`/blog-detail?id=${item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={64} color={COLORS.gray300} />
            <Text style={styles.emptyText}>No blogs available</Text>
            <Text style={styles.emptySubtext}>Check back later for new posts</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    marginTop: 4,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray600,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray400,
    marginTop: 8,
  },
});