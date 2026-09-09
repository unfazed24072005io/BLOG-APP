const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // ← Use Render's PORT

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins (you can restrict to your domain later)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Configure multer for file uploads - store in memory
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Cloudinary Configuration
const CLOUD_NAME = 'p5ieb7zx';
const UPLOAD_PRESET = 'blog_app_videos';

// Video upload endpoint
app.post('/api/upload-video', (req, res, next) => {
  console.log('📤 Received upload request');
  console.log('📤 Content-Type:', req.headers['content-type']);
  
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    return res.status(400).json({ error: 'Invalid content type. Expected multipart/form-data' });
  }
  
  next();
}, upload.single('video'), async (req, res) => {
  try {
    console.log('📤 Proxy: Processing video upload');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    console.log('📁 File size:', req.file.size, 'bytes');
    console.log('📁 File mimetype:', req.file.mimetype);

    // Create form data for Cloudinary
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname || 'video.mp4',
      contentType: req.file.mimetype || 'video/mp4',
    });
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'blog/videos');

    console.log('📡 Sending to Cloudinary...');

    // Upload to Cloudinary
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000,
      }
    );

    console.log('✅ Cloudinary upload successful');
    console.log('📥 Cloudinary response:', response.data.secure_url);

    res.json({
      success: true,
      url: response.data.secure_url,
      data: response.data
    });

  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    if (error.response) {
      console.error('📥 Cloudinary error response:', error.response.data);
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Upload failed',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running at http://localhost:${PORT}`);
  console.log(`📤 Upload endpoint: http://localhost:${PORT}/api/upload-video`);
});