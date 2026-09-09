import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
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
  const videoRef = useRef(null);

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
      console.log('✅ getBlog() returned:', data ? 'Blog found' : 'null');
      
      if (data) {
        console.log('📝 Blog data:', {
          id: data.id,
          title: data.title,
          author: data.author,
          hasImage: !!data.imageUrl,
          hasVideo: !!data.videoUrl,
          videoUrl: data.videoUrl,
          mediaType: data.mediaType,
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
    blogTitle: blog?.title,
    hasVideo: blog?.videoUrl ? true : false,
    videoUrl: blog?.videoUrl
  });

  if (isLoading || !blog) {
    console.log('⏳ Showing loading spinner');
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.gray500 }}>Loading blog...</Text>
      </View>
    );
  }

  const formattedDate = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : '';

  const hasVideo = blog.videoUrl && blog.videoUrl.length > 0;
  const hasImage = blog.imageUrl && blog.imageUrl.length > 0;

  console.log('🎬 Video check:', {
    hasVideo,
    videoUrl: blog.videoUrl,
    videoUrlLength: blog.videoUrl?.length || 0,
    mediaType: blog.mediaType
  });

  // Render video player based on platform
  const renderVideoPlayer = () => {
    console.log('🎬 Rendering video player, hasVideo:', hasVideo);
    
    if (!hasVideo) {
      console.log('❌ No video to render');
      return null;
    }

    console.log('🎬 Platform:', Platform.OS);
    console.log('🎬 Video URL:', blog.videoUrl);

    if (Platform.OS === 'web') {
      console.log('🌐 Using HTML5 video for web');
      // Use HTML5 video for web
      return (
        <View style={styles.videoContainer}>
          <video
            src={blog.videoUrl}
            controls
            playsInline
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#000',
            }}
            onLoadedMetadata={() => console.log('✅ Video metadata loaded')}
            onError={(e) => console.error('❌ Video error:', e)}
          />
          <View style={styles.videoBadge}>
            <Feather name="video" size={14} color={COLORS.white} />
            <Text style={styles.videoBadgeText}>Video</Text>
          </View>
        </View>
      );
    }

    // Use expo-av for native
    console.log('📱 Using expo-av for native');
    return (
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: blog.videoUrl }}
          style={styles.videoPlayer}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          shouldPlay={false}
          onLoad={() => console.log('✅ Video loaded successfully')}
          onError={(error) => console.error('❌ Video error:', error)}
        />
        <View style={styles.videoBadge}>
          <Feather name="video" size={14} color={COLORS.white} />
          <Text style={styles.videoBadgeText}>Video</Text>
        </View>
      </View>
    );
  };

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
        {/* Video Player */}
        {renderVideoPlayer()}

        {/* Image */}
        {hasImage && !hasVideo && (
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
            {hasVideo && (
              <View style={styles.metaItem}>
                <Feather name="video" size={14} color={COLORS.gray500} />
                <Text style={styles.metaText}>Video</Text>
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
  videoContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  videoBadgeText: {
    fontSize: 12,
    color: COLORS.white,
    fontFamily: 'Inter_500Medium',
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