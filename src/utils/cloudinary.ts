import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const PROXY_URL = 'http://localhost:3000';

export const uploadVideo = async (videoUri: string): Promise<string> => {
  try {
    console.log('🎬 Uploading video via proxy server...');
    console.log('📁 Video URI:', videoUri);

    // Create form data
    const formData = new FormData();
    
    // Get the file as blob
    const response = await fetch(videoUri);
    const blob = await response.blob();
    
    // Append with proper filename
    formData.append('video', blob, 'video.mp4');
    
    console.log('📊 FormData created, blob size:', blob.size);

    // Upload to proxy server
    const uploadResponse = await fetch(`${PROXY_URL}/api/upload-video`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await uploadResponse.json();
    console.log('📥 Proxy response:', data);

    if (data.success && data.url) {
      console.log('✅ Video uploaded successfully to Cloudinary:', data.url);
      return data.url;
    } else {
      throw new Error(data.error || data.message || 'Upload failed');
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};

export const pickVideo = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      console.log('🎬 Video selected:', result.assets[0].uri);
      return result.assets[0];
    }
    return null;
  } catch (error) {
    console.error('❌ Error picking video:', error);
    throw error;
  }
};