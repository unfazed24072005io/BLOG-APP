import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useBlog } from '@/context/BlogContext';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/utils/constants';

export default function CreateBlogScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const editId = params.editId as string;
  const { createBlog, updateBlog, getBlog, loading } = useBlog();
  const { user, userProfile } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<any>(null);
  const [existingImage, setExistingImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editId) {
      loadBlog();
    }
  }, [editId]);

  const loadBlog = async () => {
    const blog = await getBlog(editId);
    if (blog) {
      setTitle(blog.title);
      setContent(blog.content);
      if (blog.imageUrl) {
        setExistingImage(blog.imageUrl);
      }
    }
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setExistingImage('');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    try {
      setIsSubmitting(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const blogData = {
        title: title.trim(),
        content: content.trim(),
        author: userProfile?.displayName || user.email || 'Anonymous',
        authorId: user.uid,
        tags: [],
        likes: 0,
        comments: [],
      };

      if (editId) {
        await updateBlog(editId, blogData);
        Alert.alert('Success', 'Blog updated successfully!');
      } else {
        await createBlog(blogData, image);
        Alert.alert('Success', 'Blog created successfully!');
      }

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.gray700} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {editId ? 'Edit Blog' : 'Create Blog'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Picker */}
        <Pressable onPress={pickImage} style={styles.imagePicker}>
          {(image || existingImage) ? (
            <Image
              source={{ uri: image?.uri || existingImage }}
              style={styles.imagePreview}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="image" size={40} color={COLORS.gray400} />
              <Text style={styles.imagePlaceholderText}>Add Cover Image</Text>
            </View>
          )}
          {(image || existingImage) && (
            <Pressable
              onPress={() => { setImage(null); setExistingImage(''); }}
              style={styles.removeImageBtn}
            >
              <Feather name="x" size={20} color={COLORS.white} />
            </Pressable>
          )}
        </Pressable>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter blog title"
              placeholderTextColor={COLORS.gray400}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Content</Text>
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Write your blog content..."
              placeholderTextColor={COLORS.gray400}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.submitButton,
            { opacity: pressed || isSubmitting ? 0.8 : 1 },
          ]}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitGradient}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitText}>
                {editId ? 'Update Blog' : 'Publish Blog'}
              </Text>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  imagePicker: {
    margin: 16,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.gray100,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    color: COLORS.gray400,
    fontSize: 14,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  form: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray700,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.gray900,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  contentInput: {
    minHeight: 200,
    paddingTop: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});