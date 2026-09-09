import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useBlog } from '@/context/BlogContext';
import { useAuth } from '@/context/AuthContext';
import { Blog } from '@/types';
import { COLORS } from '@/utils/constants';

export default function BlogDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const blogId = params.id as string;
  const { getBlog, loading } = useBlog();
  const { isAdmin } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🔵 BlogDetailScreen mounted');
  console.log('📌 Params:', params);
  console.log('📌 Blog ID:', blogId);
  console.log('📌 Context loading state:', loading);

  useEffect(() => {
    console.log('🔄 useEffect triggered, blogId:', blogId);
    if (blogId) {
      loadBlog();
    } else {
      console.log('❌ No blog ID provided');
      setIsLoading(false);
    }
  }, [blogId]);

  const loadBlog = async () => {
    console.log('📖 Starting to load blog with ID:', blogId);
    setIsLoading(true);
    
    try {
      console.log('📡 Calling getBlog()...');
      const data = await getBlog(blogId);
      console.log('✅ getBlog() returned:', data);
      
      if (data) {
        console.log('📝 Blog data:', {
          id: data.id,
          title: data.title,
          author: data.author,
          hasImage: !!data.imageUrl,
          createdAt: data.createdAt
        });
        setBlog(data);
      } else {
        console.log('⚠️ Blog not found for ID:', blogId);
        setBlog(null);
      }
    } catch (error) {
      console.error('❌ Error loading blog:', error);
      setBlog(null);
    } finally {
      console.log('🏁 Setting isLoading to false');
      setIsLoading(false);
    }
  };

  console.log('📊 Render state:', { 
    isLoading, 
    hasBlog: !!blog, 
    blogTitle: blog?.title 
  });

  // Show loading state
  if (isLoading) {
    console.log('⏳ Showing loading spinner');
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.gray500, fontFamily: 'Inter_400Regular' }}>
          Loading blog...
        </Text>
        <Text style={{ marginTop: 8, color: COLORS.gray400, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
          ID: {blogId}
        </Text>
      </View>
    );
  }

  // Show error/empty state
  if (!blog) {
    console.log('❌ No blog found, showing error state');
    return (
      <View style={[styles.container, styles.centered]}>
        <Feather name="file-text" size={64} color={COLORS.gray300} />
        <Text style={{ marginTop: 16, fontSize: 18, color: COLORS.gray600, fontFamily: 'Inter_600SemiBold' }}>
          Blog not found
        </Text>
        <Text style={{ marginTop: 8, color: COLORS.gray400, fontFamily: 'Inter_400Regular' }}>
          The blog you're looking for doesn't exist
        </Text>
        <Pressable 
          onPress={() => router.back()} 
          style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 12 }}
        >
          <Text style={{ color: COLORS.white, fontFamily: 'Inter_600SemiBold' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  console.log('✅ Rendering blog content:', blog.title);
  const formattedDate = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : '';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.gray700} />
        </Pressable>
        <Text style={styles.headerTitle}>Blog Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {blog.imageUrl && (
          <Image source={{ uri: blog.imageUrl }} style={styles.coverImage} />
        )}

        <View style={styles.content}>
          {blog.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{blog.category}</Text>
            </View>
          )}
          
          <Text style={styles.title}>{blog.title}</Text>

          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Feather name="user" size={14} color={COLORS.gray500} />
              <Text style={styles.metaText}>{blog.author}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="calendar" size={14} color={COLORS.gray500} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
            {blog.readingTime && (
              <View style={styles.metaItem}>
                <Feather name="clock" size={14} color={COLORS.gray500} />
                <Text style={styles.metaText}>{blog.readingTime} min read</Text>
              </View>
            )}
          </View>

          {blog.tags && blog.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {blog.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.body}>{blog.content}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  scrollView: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.gray500,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.gray700,
  },
});