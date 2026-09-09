import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useBlog } from '@/context/BlogContext';
import { useAuth } from '@/context/AuthContext';
import { BlogCard } from '@/components/BlogCard';
import CreateBlogModal from '@/components/CreateBlogModal';
import { COLORS } from '@/utils/constants';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { blogs, loading, deleteBlog, refreshBlogs } = useBlog();
  const { logout, userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);

  console.log('🔵 AdminDashboard rendered, userProfile:', userProfile);

  // Chart data - blog views or engagement
  const chartData = [12, 19, 15, 22, 18, 25, 20];
  const chartHeight = 140;
  const chartWidth = width - 100;
  const padding = 20;
  const maxValue = Math.max(...chartData);
  const minValue = Math.min(...chartData);

  const getYPosition = (value: number) => {
    const availableHeight = chartHeight - (padding * 2);
    return padding + availableHeight - ((value - minValue) / (maxValue - minValue || 1)) * availableHeight;
  };

  const generateLinePath = () => {
    const stepX = chartWidth / (chartData.length - 1);
    let path = "";
    chartData.forEach((value, index) => {
      const x = index * stepX;
      const y = getYPosition(value);
      if (index === 0) path += `M ${x} ${y}`;
      else path += ` L ${x} ${y}`;
    });
    return path;
  };

  const onRefresh = useCallback(async () => {
    console.log('🔄 Refreshing blogs...');
    setRefreshing(true);
    await refreshBlogs();
    setRefreshing(false);
    console.log('✅ Refresh complete');
  }, [refreshBlogs]);

  const handleDelete = useCallback((blog: any) => {
    console.log('🗑️ Delete blog:', blog.title);
    Alert.alert(
      'Delete Blog',
      `Are you sure you want to delete "${blog.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('✅ Confirmed delete for:', blog.title);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteBlog(blog.id);
          },
        },
      ]
    );
  }, [deleteBlog]);

  const handleEdit = useCallback((blog: any) => {
    console.log('✏️ Edit blog:', blog.title);
    setEditingBlog(blog);
    setModalVisible(true);
  }, []);

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

  const handleModalSuccess = useCallback(() => {
    console.log('✅ Modal success, refreshing blogs...');
    refreshBlogs();
    setEditingBlog(null);
  }, [refreshBlogs]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getGreetingName = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName.split(' ')[0];
    }
    return "Admin";
  };

  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.length;

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
{/* Header */}
<View style={styles.headerRow}>
  <View style={styles.headerLeft}>
    <Text style={styles.greetingText}>{getGreeting()},</Text>
    <Text style={styles.userNameText}>{getGreetingName()}!</Text>
  </View>
  <View style={styles.headerActions}>
    <Pressable 
      onPress={() => {
        console.log('➕ Add Blog button pressed');
        setEditingBlog(null);
        setModalVisible(true);
      }} 
      style={({ pressed }) => [
        styles.addBtn,
        { 
          opacity: pressed ? 0.7 : 1, 
          transform: [{ scale: pressed ? 0.95 : 1 }] 
        }
      ]}
    >
      <Feather name="plus" size={20} color="#FFFFFF" />
    </Pressable>
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
      <Feather name="log-out" size={20} color="#EF4444" />
    </Pressable>
  </View>
</View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardBlue]}>
          <Feather name="book-open" size={20} color="#3B82F6" />
          <Text style={styles.statNumber}>{totalBlogs}</Text>
          <Text style={styles.statLabel}>Total Blogs</Text>
        </View>
        <View style={[styles.statCard, styles.statCardGreen]}>
          <Feather name="check-circle" size={20} color="#10B981" />
          <Text style={styles.statNumber}>{publishedBlogs}</Text>
          <Text style={styles.statLabel}>Published</Text>
        </View>
        <View style={[styles.statCard, styles.statCardPurple]}>
          <Feather name="eye" size={20} color="#8B5CF6" />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Total Views</Text>
        </View>
      </View>

      {/* My Blogs Section */}
      <Text style={styles.sectionTitle}>My Blogs</Text>

      {blogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Feather name="file-text" size={48} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyText}>No blogs yet</Text>
          <Text style={styles.emptySubtext}>
            Start creating your first blog post
          </Text>
          <Pressable
            onPress={() => {
              console.log('➕ Create blog button pressed');
              setEditingBlog(null);
              setModalVisible(true);
            }}
            style={styles.emptyBtn}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyBtnGradient}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.emptyBtnText}>Create Blog</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <View style={styles.blogsGrid}>
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              onPress={() => {
                console.log('📖 Open blog:', blog.title);
                router.push(`/blog-detail?id=${blog.id}`);
              }}
              onEdit={() => handleEdit(blog)}
              onDelete={() => handleDelete(blog)}
            />
          ))}
        </View>
      )}

      {/* Create/Edit Blog Modal */}
      <CreateBlogModal
        visible={modalVisible}
        onClose={() => {
          console.log('❌ Modal closed');
          setModalVisible(false);
          setEditingBlog(null);
        }}
        onSuccess={handleModalSuccess}
        editId={editingBlog?.id}
        editData={editingBlog}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },
  userNameText: {
    fontSize: 24,
    color: '#111827',
    fontFamily: 'Inter_700Bold',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtn: {
    position: 'relative',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statCardBlue: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  statCardGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statCardPurple: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.3,
  },
  blogsGrid: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },
  emptyBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.2,
  },
  createBtnFixed: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
headerActions: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},
addBtn: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: COLORS.primary,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 3,
},
logoutBtn: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: '#FEE2E2',
  alignItems: 'center',
  justifyContent: 'center',
},
  createBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.2,
  },
});