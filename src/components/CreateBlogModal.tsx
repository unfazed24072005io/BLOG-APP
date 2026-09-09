import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useBlog } from '@/context/BlogContext';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/utils/constants';

interface CreateBlogModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editId?: string | null;
  editData?: any;
}

export default function CreateBlogModal({ 
  visible, 
  onClose, 
  onSuccess,
  editId,
  editData 
}: CreateBlogModalProps) {
  const { createBlog, updateBlog } = useBlog();
  const { user, userProfile } = useAuth();
  
  const [title, setTitle] = useState(editData?.title || '');
  const [content, setContent] = useState(editData?.content || '');
  const [image, setImage] = useState<any>(null);
  const [existingImage, setExistingImage] = useState(editData?.imageUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState(editData?.tags?.join(', ') || '');
  const [category, setCategory] = useState(editData?.category || 'General');

  const categories = ['General', 'Technology', 'Business', 'Lifestyle', 'Health', 'Education', 'Travel', 'Food', 'Fashion', 'Sports'];

  const convertToBase64 = async (imageUri: string): Promise<string> => {
    try {
      console.log('📤 Converting image to base64...');
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      console.log('✅ Base64 length:', base64.length);
      return base64;
    } catch (error) {
      console.error('❌ Base64 conversion error:', error);
      throw error;
    }
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: Platform.OS !== 'web',
      });

      if (!result.canceled) {
        console.log('📸 Image selected:', result.assets[0].uri);
        setImage(result.assets[0]);
        setExistingImage('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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

      let imageUrl = existingImage || '';

      // Convert image to base64 if selected
      if (image) {
        try {
          console.log('📤 Converting selected image to base64...');
          const base64String = await convertToBase64(image.uri);
          imageUrl = base64String;
          console.log('✅ Image converted to base64, length:', imageUrl.length);
        } catch (error) {
          console.error('❌ Image conversion failed:', error);
          Alert.alert('Warning', 'Image conversion failed. Blog will be created without image.');
        }
      }

      const blogData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: content.trim().substring(0, 150) + '...',
        author: userProfile?.displayName || user.email?.split('@')[0] || 'Anonymous',
        authorId: user.uid,
        authorEmail: user.email || '',
        category: category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        imageUrl: imageUrl, // This is now base64 string
        likes: 0,
        comments: [],
        status: 'published',
        readingTime: Math.ceil(content.trim().split(/\s+/).length / 200),
        views: 0,
        shares: 0,
        publishedAt: new Date().toISOString(),
      };

      console.log('📝 Saving blog data with base64 image');
      console.log('📊 Image URL length:', imageUrl.length);

      if (editId) {
        await updateBlog(editId, blogData);
        Alert.alert('Success', 'Blog updated successfully!');
      } else {
        await createBlog(blogData);
        Alert.alert('Success', 'Blog created successfully!');
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('❌ Submit error:', error);
      Alert.alert('Error', 'Failed to save blog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImage(null);
    setExistingImage('');
    setTags('');
    setCategory('General');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editId ? 'Edit Blog' : 'Create New Blog'}
                </Text>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <Feather name="x" size={24} color={COLORS.gray600} />
                </Pressable>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
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
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter blog title"
                      placeholderTextColor={COLORS.gray400}
                      value={title}
                      onChangeText={setTitle}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={styles.categoryScroll}
                    >
                      {categories.map((cat) => (
                        <Pressable
                          key={cat}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setCategory(cat);
                          }}
                          style={[
                            styles.categoryChip,
                            category === cat && styles.categoryChipActive,
                          ]}
                        >
                          <Text style={[
                            styles.categoryChipText,
                            category === cat && styles.categoryChipTextActive,
                          ]}>
                            {cat}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tags</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter tags (comma separated)"
                      placeholderTextColor={COLORS.gray400}
                      value={tags}
                      onChangeText={setTags}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Content *</Text>
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

                {/* Submit Button */}
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
                      <>
                        <Feather name={editId ? 'edit-2' : 'plus'} size={20} color={COLORS.white} />
                        <Text style={styles.submitText}>
                          {editId ? 'Update Blog' : 'Publish Blog'}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
    fontFamily: 'Inter_700Bold',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imagePicker: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.gray100,
    position: 'relative',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderStyle: 'dashed',
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
    fontFamily: 'Inter_400Regular',
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
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray700,
    marginBottom: 8,
    fontFamily: 'Inter_500Medium',
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
    fontFamily: 'Inter_400Regular',
  },
  contentInput: {
    minHeight: 150,
    paddingTop: 12,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: COLORS.gray600,
    fontFamily: 'Inter_500Medium',
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'Inter_600SemiBold',
  },
});