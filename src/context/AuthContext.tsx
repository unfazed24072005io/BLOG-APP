import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { User as UserType } from '@/types';
import { router } from 'expo-router';

interface AuthContextType {
  user: User | null;
  userRole: 'admin' | 'user' | null;
  userProfile: UserType | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, role: 'admin' | 'user') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  clearError: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (data: Partial<UserType>) => Promise<{ success: boolean; error?: string }>;
  updateUserEmail: (newEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteUserAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
  refreshUserProfile: () => Promise<void>;
  verifyEmail: () => Promise<{ success: boolean; error?: string }>;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 Setting up auth listener...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('📡 Auth state changed:', firebaseUser?.email || 'No user');
      setUser(firebaseUser);
      
      if (firebaseUser) {
        console.log('👤 User found, fetching profile...');
        await fetchUserProfile(firebaseUser.uid);
      } else {
        console.log('🚫 No user found, clearing state');
        setUserRole(null);
        setUserProfile(null);
      }
      setLoading(false);
      console.log('✅ Auth loading complete');
    });

    return () => {
      console.log('🛑 Unsubscribing from auth listener');
      unsubscribe();
    };
  }, []);

  // Auto-redirect when user and role are available
  useEffect(() => {
    if (!loading && user && userRole) {
      console.log(`🚀 Auto-redirecting to dashboard... User: ${user.email}, Role: ${userRole}`);
      
      if (userRole === 'admin') {
        router.replace('/(tabs)/admin');
      } else {
        router.replace('/(tabs)/user');
      }
    }
  }, [user, userRole, loading]);

  const fetchUserProfile = async (uid: string) => {
    try {
      console.log(`📁 Fetching user profile for UID: ${uid}`);
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserType;
        console.log('✅ User profile found:', userData.role);
        setUserProfile(userData);
        setUserRole(userData.role);
      } else {
        console.log('⚠️ No user profile document found');
        setUserRole(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      setUserRole(null);
      setUserProfile(null);
    }
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    console.log('🔄 Refreshing user profile...');
    await fetchUserProfile(user.uid);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log(`🔑 Attempting login for: ${email}`);
    
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful!');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Login error:', error.code);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') errorMessage = 'User not found. Please sign up first.';
      else if (error.code === 'auth/wrong-password') errorMessage = 'Incorrect password.';
      else if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address.';
      else if (error.code === 'auth/too-many-requests') errorMessage = 'Too many attempts. Try again later.';
      else if (error.code === 'auth/user-disabled') errorMessage = 'This account has been disabled.';
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (email: string, password: string, role: 'admin' | 'user'): Promise<{ success: boolean; error?: string }> => {
    console.log(`📝 Attempting signup for: ${email} (${role})`);
    
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Signup successful!');
      
      const userData: UserType = {
        id: user.uid,
        email: user.email || '',
        role: role,
        displayName: email.split('@')[0],
        photoURL: '',
        phoneNumber: '',
        address: '',
        bio: '',
        website: '',
        company: '',
        jobTitle: '',
        socialLinks: {
          twitter: '',
          linkedin: '',
          github: '',
          instagram: '',
        },
        preferences: {
          theme: 'light',
          notifications: true,
          emailUpdates: true,
        },
        isEmailVerified: false,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log('💾 Saving user profile to Firestore...');
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        createdAt: userData.createdAt.toISOString(),
        lastLoginAt: userData.lastLoginAt.toISOString(),
        updatedAt: userData.updatedAt.toISOString(),
      });
      console.log('✅ User profile saved!');
      
      // Send email verification
      try {
        await sendEmailVerification(user);
        console.log('📧 Verification email sent');
      } catch (verificationError) {
        console.warn('⚠️ Could not send verification email');
      }
      
      setUserRole(role);
      setUserProfile(userData);
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Signup error:', error.code);
      
      let errorMessage = 'Signup failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Email already in use.';
      else if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address.';
      else if (error.code === 'auth/weak-password') errorMessage = 'Password should be at least 6 characters.';
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
  console.log('🚪 AuthContext.logout() called');
  console.log('Current user before logout:', user?.email);
  
  try {
    console.log('📡 Calling signOut...');
    await signOut(auth);
    console.log('✅ signOut completed successfully');
    
    console.log('🧹 Clearing local state...');
    setUser(null);
    setUserRole(null);
    setUserProfile(null);
    
    console.log('🔄 Navigating to login...');
    // Force navigation
    router.dismissAll();
    router.replace('/login');
    console.log('✅ Navigation completed');
  } catch (error) {
    console.error('❌ Logout error:', error);
    Alert.alert('Error', 'Failed to logout. Please try again.');
  }
};
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    console.log(`🔑 Sending password reset email to: ${email}`);
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email.';
      if (error.code === 'auth/user-not-found') errorMessage = 'No account found with this email.';
      else if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address.';
      return { success: false, error: errorMessage };
    }
  };

  const verifyEmail = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user logged in' };
    try {
      await sendEmailVerification(user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateUserProfile = async (data: Partial<UserType>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    console.log('📝 Updating user profile');
    try {
      if (data.displayName || data.photoURL) {
        await updateProfile(user, {
          displayName: data.displayName || user.displayName,
          photoURL: data.photoURL || user.photoURL,
        });
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });

      if (userProfile) {
        setUserProfile({ ...userProfile, ...data });
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateUserEmail = async (newEmail: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      const credential = EmailAuthProvider.credential(user.email || '', password);
      await reauthenticateWithCredential(user, credential);
      await firebaseUpdateEmail(user, newEmail);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        email: newEmail,
        updatedAt: new Date().toISOString(),
        isEmailVerified: false,
      });
      
      await refreshUserProfile();
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Failed to update email.';
      if (error.code === 'auth/wrong-password') errorMessage = 'Incorrect password.';
      else if (error.code === 'auth/email-already-in-use') errorMessage = 'Email already in use.';
      return { success: false, error: errorMessage };
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      const credential = EmailAuthProvider.credential(user.email || '', currentPassword);
      await reauthenticateWithCredential(user, credential);
      await firebaseUpdatePassword(user, newPassword);
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Failed to update password.';
      if (error.code === 'auth/wrong-password') errorMessage = 'Current password is incorrect.';
      else if (error.code === 'auth/weak-password') errorMessage = 'New password should be at least 6 characters.';
      return { success: false, error: errorMessage };
    }
  };

  const deleteUserAccount = async (password: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      const credential = EmailAuthProvider.credential(user.email || '', password);
      await reauthenticateWithCredential(user, credential);
      
      // Delete user data
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Delete user's blogs
      const blogsQuery = query(collection(db, 'blogs'), where('authorId', '==', user.uid));
      const blogsSnapshot = await getDocs(blogsQuery);
      for (const blogDoc of blogsSnapshot.docs) {
        await deleteDoc(blogDoc.ref);
      }
      
      await user.delete();
      router.replace('/login');
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Failed to delete account.';
      if (error.code === 'auth/wrong-password') errorMessage = 'Incorrect password.';
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => setError(null);

  const isAdmin = userRole === 'admin';
  const isEmailVerified = user?.emailVerified || false;

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      userProfile,
      loading,
      error,
      login,
      signup,
      logout,
      isAdmin,
      clearError,
      resetPassword,
      updateUserProfile,
      updateUserEmail,
      updateUserPassword,
      deleteUserAccount,
      refreshUserProfile,
      verifyEmail,
      isEmailVerified,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};