import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Blog } from '@/types';
import { COLORS } from '@/utils/constants';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

interface BlogCardProps {
  blog: Blog;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  variant?: 'default' | 'compact' | 'featured';
}

export const BlogCard: React.FC<BlogCardProps> = ({ 
  blog, 
  onPress, 
  onEdit, 
  onDelete,
  onLike,
  onBookmark,
  onShare,
  variant = 'default'
}) => {
  const { isAdmin } = useAuth();
  
  const formattedDate = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : '';

  const readingTime = blog.readingTime || Math.ceil((blog.content?.split(/\s+/).length || 0) / 200);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Technology': '#3B82F6',
      'Business': '#10B981',
      'Lifestyle': '#8B5CF6',
      'Health': '#EF4444',
      'Education': '#F59E0B',
      'Travel': '#06B6D4',
      'Food': '#F97316',
      'Fashion': '#EC4899',
      'Sports': '#14B8A6',
      'General': '#6B7280',
    };
    return colors[category] || colors['General'];
  };

  const categoryColor = getCategoryColor(blog.category);

  const renderContent = () => {
    switch (variant) {
      case 'featured':
        return (
          <Pressable onPress={onPress} style={({ pressed }) => [
            styles.featuredCard,
            { opacity: pressed ? 0.95 : 1 }
          ]}>
            {blog.imageUrl && (
              <Image source={{ uri: blog.imageUrl }} style={styles.featuredImage} />
            )}
            <View style={styles.featuredOverlay}>
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.featuredGradient}
              />
              <View style={styles.featuredContent}>
                {blog.category && (
                  <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                    <Text style={styles.categoryBadgeText}>{blog.category}</Text>
                  </View>
                )}
                <Text style={styles.featuredTitle} numberOfLines={2}>
                  {blog.title}
                </Text>
                <Text style={styles.featuredPreview} numberOfLines={2}>
                  {blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                </Text>
                <View style={styles.featuredFooter}>
                  <View style={styles.authorContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {blog.author?.charAt(0).toUpperCase() || 'A'}
                      </Text>
                    </View>
                    <Text style={styles.featuredAuthor}>{blog.author}</Text>
                  </View>
                  <Text style={styles.featuredDate}>{formattedDate}</Text>
                </View>
              </View>
            </View>
            {isAdmin && (
              <View style={styles.featuredActions}>
                <Pressable onPress={onEdit} style={styles.actionBtn}>
                  <Feather name="edit-2" size={16} color={COLORS.white} />
                </Pressable>
                <Pressable onPress={onDelete} style={styles.actionBtn}>
                  <Feather name="trash-2" size={16} color={COLORS.white} />
                </Pressable>
              </View>
            )}
          </Pressable>
        );

      case 'compact':
        return (
          <Pressable onPress={onPress} style={({ pressed }) => [
            styles.compactCard,
            { opacity: pressed ? 0.95 : 1 }
          ]}>
            {blog.imageUrl && (
              <Image source={{ uri: blog.imageUrl }} style={styles.compactImage} />
            )}
            <View style={styles.compactContent}>
              <Text style={styles.compactTitle} numberOfLines={2}>
                {blog.title}
              </Text>
              <View style={styles.compactMeta}>
                <Text style={styles.compactAuthor}>{blog.author}</Text>
                <Text style={styles.compactDate}>{formattedDate}</Text>
              </View>
            </View>
          </Pressable>
        );

      default:
        return (
          <Pressable onPress={onPress} style={({ pressed }) => [
            styles.card,
            { opacity: pressed ? 0.95 : 1 }
          ]}>
            {blog.imageUrl && (
              <Image source={{ uri: blog.imageUrl }} style={styles.image} />
            )}
            <View style={styles.content}>
              <View style={styles.headerRow}>
                {blog.category && (
                  <View style={[styles.categoryChip, { backgroundColor: categoryColor + '20' }]}>
                    <Text style={[styles.categoryChipText, { color: categoryColor }]}>
                      {blog.category}
                    </Text>
                  </View>
                )}
                {blog.isFeatured && (
                  <View style={styles.featuredChip}>
                    <Feather name="star" size={12} color="#F59E0B" />
                    <Text style={styles.featuredChipText}>Featured</Text>
                  </View>
                )}
              </View>

              <Text style={styles.title} numberOfLines={2}>
                {blog.title}
              </Text>
              
              <Text style={styles.preview} numberOfLines={2}>
                {blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').substring(0, 120)}...
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Feather name="clock" size={12} color={COLORS.gray400} />
                  <Text style={styles.metaText}>{readingTime} min read</Text>
                </View>
                {blog.views !== undefined && (
                  <View style={styles.metaItem}>
                    <Feather name="eye" size={12} color={COLORS.gray400} />
                    <Text style={styles.metaText}>{blog.views}</Text>
                  </View>
                )}
                {blog.likes !== undefined && (
                  <View style={styles.metaItem}>
                    <Feather name="heart" size={12} color={COLORS.gray400} />
                    <Text style={styles.metaText}>{blog.likes}</Text>
                  </View>
                )}
              </View>

              <View style={styles.footer}>
                <View style={styles.meta}>
                  <View style={styles.authorContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {blog.author?.charAt(0).toUpperCase() || 'A'}
                      </Text>
                    </View>
                    <Text style={styles.author}>{blog.author}</Text>
                  </View>
                  <View style={styles.dateContainer}>
                    <Feather name="calendar" size={12} color={COLORS.gray400} />
                    <Text style={styles.date}>{formattedDate}</Text>
                  </View>
                </View>
                {isAdmin && (
                  <View style={styles.actions}>
                    <Pressable onPress={onEdit} style={styles.actionBtn}>
                      <Feather name="edit-2" size={16} color={COLORS.primary} />
                    </Pressable>
                    <Pressable onPress={onDelete} style={styles.actionBtn}>
                      <Feather name="trash-2" size={16} color={COLORS.error} />
                    </Pressable>
                  </View>
                )}
              </View>

              {!isAdmin && (onLike || onBookmark || onShare) && (
                <View style={styles.interactionRow}>
                  {onLike && (
                    <Pressable onPress={onLike} style={styles.interactionBtn}>
                      <Feather name="heart" size={16} color={COLORS.gray500} />
                      <Text style={styles.interactionText}>Like</Text>
                    </Pressable>
                  )}
                  {onBookmark && (
                    <Pressable onPress={onBookmark} style={styles.interactionBtn}>
                      <Feather name="bookmark" size={16} color={COLORS.gray500} />
                      <Text style={styles.interactionText}>Save</Text>
                    </Pressable>
                  )}
                  {onShare && (
                    <Pressable onPress={onShare} style={styles.interactionBtn}>
                      <Feather name="share-2" size={16} color={COLORS.gray500} />
                      <Text style={styles.interactionText}>Share</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </Pressable>
        );
    }
  };

  return <>{renderContent()}</>;
};

const styles = StyleSheet.create({
  // Default Card Styles
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 4,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  featuredChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },
  featuredChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#F59E0B',
    fontFamily: 'Inter_500Medium',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 6,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 22,
  },
  preview: {
    fontSize: 14,
    color: COLORS.gray500,
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Inter_400Regular',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.gray400,
    fontFamily: 'Inter_400Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  author: {
    fontSize: 12,
    color: COLORS.gray600,
    fontFamily: 'Inter_500Medium',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 11,
    color: COLORS.gray400,
    fontFamily: 'Inter_400Regular',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 6,
  },
  interactionRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  interactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  interactionText: {
    fontSize: 13,
    color: COLORS.gray500,
    fontFamily: 'Inter_400Regular',
  },

  // Featured Card Styles
  featuredCard: {
    borderRadius: 16,
    marginHorizontal: 4,
    marginVertical: 8,
    overflow: 'hidden',
    height: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
    fontFamily: 'Inter_700Bold',
    lineHeight: 26,
  },
  featuredPreview: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredAuthor: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter_500Medium',
  },
  featuredDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Inter_400Regular',
  },
  featuredActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'Inter_600SemiBold',
  },

  // Compact Card Styles
  compactCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  compactImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  compactContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 18,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactAuthor: {
    fontSize: 11,
    color: COLORS.gray500,
    fontFamily: 'Inter_400Regular',
  },
  compactDate: {
    fontSize: 11,
    color: COLORS.gray400,
    fontFamily: 'Inter_400Regular',
  },
});