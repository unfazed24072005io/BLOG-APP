import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { Blog } from '@/types';

interface BlogContextType {
  blogs: Blog[];
  loading: boolean;
  createBlog: (blogData: any) => Promise<void>;
  updateBlog: (id: string, blog: Partial<Blog>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  getBlog: (id: string) => Promise<Blog | null>;
  getBlogsByUser: (userId: string) => Promise<Blog[]>;
  refreshBlogs: () => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching blogs from Firestore...');
      
      const blogsQuery = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(blogsQuery);
      
      console.log(`📊 Found ${querySnapshot.size} blogs`);
      
      const blogsList: Blog[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📝 Blog: ${data.title}, ID: ${doc.id}`);
        blogsList.push({
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          author: data.author || '',
          authorId: data.authorId || '',
          authorEmail: data.authorEmail || '',
          category: data.category || 'General',
          tags: data.tags || [],
          imageUrl: data.imageUrl || '',
          likes: data.likes || 0,
          comments: data.comments || [],
          status: data.status || 'published',
          readingTime: data.readingTime || 0,
          views: data.views || 0,
          shares: data.shares || 0,
          publishedAt: data.publishedAt || new Date().toISOString(),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as Blog);
      });
      
      setBlogs(blogsList);
      console.log('✅ Blogs loaded successfully:', blogsList.length);
    } catch (error) {
      console.error('❌ Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Removed Firebase Storage upload, just store the base64 directly
  const createBlog = async (blogData: any) => {
    try {
      console.log('📝 Creating blog with image length:', blogData.imageUrl?.length || 0);
      console.log('📝 Image starts with:', blogData.imageUrl?.substring(0, 50) || 'No image');
      
      const newBlog = {
        ...blogData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'blogs'), newBlog);
      console.log('✅ Blog created with ID:', docRef.id);
      await fetchBlogs();
    } catch (error) {
      console.error('❌ Error creating blog:', error);
      throw error;
    }
  };

  const updateBlog = async (id: string, blogData: Partial<Blog>) => {
    try {
      console.log('📝 Updating blog:', id);
      console.log('📝 Image length:', blogData.imageUrl?.length || 0);
      
      const blogRef = doc(db, 'blogs', id);
      await updateDoc(blogRef, {
        ...blogData,
        updatedAt: Timestamp.now(),
      });
      console.log('✅ Blog updated');
      await fetchBlogs();
    } catch (error) {
      console.error('❌ Error updating blog:', error);
      throw error;
    }
  };

  const deleteBlog = async (id: string) => {
    try {
      console.log('🗑️ Deleting blog:', id);
      await deleteDoc(doc(db, 'blogs', id));
      console.log('✅ Blog deleted');
      await fetchBlogs();
    } catch (error) {
      console.error('❌ Error deleting blog:', error);
      throw error;
    }
  };

  const getBlog = async (id: string): Promise<Blog | null> => {
    console.log('📖 BlogContext.getBlog() called with ID:', id);
    
    if (!id) {
      console.log('❌ No ID provided to getBlog');
      return null;
    }
    
    try {
      console.log('📡 Fetching document from Firestore for ID:', id);
      const blogRef = doc(db, 'blogs', id);
      const blogDoc = await getDoc(blogRef);
      console.log('📄 Document exists:', blogDoc.exists());
      
      if (blogDoc.exists()) {
        const data = blogDoc.data();
        console.log('📊 Document data found:', data.title);
        console.log('📊 Image URL length:', data.imageUrl?.length || 0);
        
        const blog = {
          id: blogDoc.id,
          title: data.title || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          author: data.author || '',
          authorId: data.authorId || '',
          authorEmail: data.authorEmail || '',
          category: data.category || 'General',
          tags: data.tags || [],
          imageUrl: data.imageUrl || '',
          likes: data.likes || 0,
          comments: data.comments || [],
          status: data.status || 'published',
          readingTime: data.readingTime || 0,
          views: data.views || 0,
          shares: data.shares || 0,
          publishedAt: data.publishedAt || new Date().toISOString(),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as Blog;
        
        console.log('✅ Blog parsed successfully:', blog.title);
        return blog;
      } else {
        console.log('⚠️ No document found for ID:', id);
        return null;
      }
    } catch (error) {
      console.error('❌ Error in getBlog:', error);
      return null;
    }
  };

  const getBlogsByUser = async (userId: string): Promise<Blog[]> => {
    try {
      console.log('📖 Getting blogs for user:', userId);
      const blogsQuery = query(
        collection(db, 'blogs'), 
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(blogsQuery);
      const blogsList: Blog[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        blogsList.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as Blog);
      });
      console.log('✅ Found', blogsList.length, 'blogs for user');
      return blogsList;
    } catch (error) {
      console.error('❌ Error getting user blogs:', error);
      return [];
    }
  };

  const refreshBlogs = async () => {
    await fetchBlogs();
  };

  return (
    <BlogContext.Provider value={{
      blogs,
      loading,
      createBlog,
      updateBlog,
      deleteBlog,
      getBlog,
      getBlogsByUser,
      refreshBlogs,
    }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};