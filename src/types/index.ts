export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  authorId: string;
  authorEmail: string;
  authorPhoto?: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  likes: number;
  likesCount?: number;
  comments: Comment[];
  commentsCount?: number;
  status: 'draft' | 'published' | 'archived';
  readingTime: number;
  views: number;
  shares: number;
  bookmarks: number;
  publishedAt: string;
  isFeatured: boolean;
  isTrending: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  likes: number;
  isEdited: boolean;
  replies: Comment[];
  parentId?: string;
  status: 'approved' | 'pending' | 'spam';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  photoURL: string;
  phoneNumber: string;
  address: string;
  bio: string;
  website: string;
  company: string;
  jobTitle: string;
  socialLinks: {
    twitter: string;
    linkedin: string;
    github: string;
    instagram: string;
    youtube: string;
    facebook: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
    timezone: string;
  };
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogStats {
  totalBlogs: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  averageReadingTime: number;
  mostLikedBlog: Blog | null;
  mostViewedBlog: Blog | null;
  categoriesBreakdown: {
    category: string;
    count: number;
  }[];
  viewsOverTime: {
    date: string;
    views: number;
  }[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'share' | 'follow' | 'mention' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  count: number;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number;
  createdAt: Date;
}

export interface Analytics {
  id: string;
  blogId: string;
  userId: string;
  type: 'view' | 'like' | 'comment' | 'share' | 'bookmark';
  referrer: string;
  device: string;
  browser: string;
  country: string;
  city: string;
  createdAt: Date;
}

export interface BlogDraft {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  status: 'draft';
  autoSaved: boolean;
  lastSavedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  query: string;
  category?: string;
  tags?: string[];
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy: 'relevance' | 'newest' | 'oldest' | 'popular' | 'mostLiked' | 'mostViewed';
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CommentFilters {
  blogId?: string;
  userId?: string;
  status?: 'approved' | 'pending' | 'spam';
  sortBy: 'newest' | 'oldest' | 'mostLiked';
  page: number;
  limit: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// Firebase Document Types
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface FirestoreDocument<T> {
  id: string;
  data: T;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// Form Types
export interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  image?: File | string;
  status: 'draft' | 'published';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  isFeatured: boolean;
}

export interface ProfileFormData {
  displayName: string;
  bio: string;
  website: string;
  company: string;
  jobTitle: string;
  phoneNumber: string;
  address: string;
  socialLinks: {
    twitter: string;
    linkedin: string;
    github: string;
    instagram: string;
    youtube: string;
    facebook: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
    timezone: string;
  };
}

export interface CommentFormData {
  content: string;
  parentId?: string;
}

// Route Params
export interface BlogDetailParams {
  id: string;
  slug?: string;
}

export interface BlogSearchParams {
  q?: string;
  category?: string;
  tag?: string;
  author?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'popular' | 'mostLiked' | 'mostViewed';
}

// Context State Types
export interface AuthContextState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
}

export interface BlogContextState {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  totalBlogs: number;
  currentPage: number;
  totalPages: number;
  filters: SearchFilters;
}

export interface ThemeContextState {
  theme: 'light' | 'dark' | 'system';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
}