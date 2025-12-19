import cloudinary from 'cloudinary';
import Problem from "../models/problem.js";
import User from "../models/user.js";
import SolutionVideo from '../models/solutionVideo.js';
import { sanitizeFilter } from 'mongoose';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const userId = req.user._id;
    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Generate unique public_id for the video
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;
    
    // Upload parameters
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({ error: 'Failed to generate upload credentials' });
  }
};


export const saveVideoMetadata = async (req, res) => {
  console.log('saveVideoMetadata called with:', req.body);
  console.log('User ID:', req.user?._id);

  try {
    const {
      problemId,
      cloudinaryPublicId,
      secureUrl,
      duration,
    } = req.body;
    
    const userId = req.user._id;

    // Validate required fields
    if (!problemId || !cloudinaryPublicId || !secureUrl) {
      console.log('Missing required fields:', { problemId, cloudinaryPublicId, secureUrl });
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['problemId', 'cloudinaryPublicId', 'secureUrl']
      });
    }

    console.log('Attempting to fetch Cloudinary resource:', cloudinaryPublicId);

    // Try to fetch the video resource from Cloudinary
    let cloudinaryResource;
    try {
      cloudinaryResource = await cloudinary.api.resource(
        cloudinaryPublicId,
        { 
          resource_type: 'video'
        }
      );
      console.log('Cloudinary resource found:', {
        public_id: cloudinaryResource.public_id,
        resource_type: cloudinaryResource.resource_type,
        format: cloudinaryResource.format,
        duration: cloudinaryResource.duration
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary API error:', {
        message: cloudinaryError.message,
        http_code: cloudinaryError.http_code,
        details: cloudinaryError
      });
      
      // If Cloudinary resource not found, we can still save with provided data
      console.log('Cloudinary resource not found, using provided data');
      // Continue without Cloudinary verification
    }

    // Check if video already exists
    const existingVideo = await SolutionVideo.findOne({
      problemId,
      userId,
      cloudinaryPublicId
    });

    if (existingVideo) {
      console.log('Video already exists:', existingVideo._id);
      return res.status(409).json({ 
        error: 'Video already exists',
        videoId: existingVideo._id 
      });
    }

    // Generate thumbnail URL
    let thumbnailUrl;
    if (cloudinaryResource) {
      // Use Cloudinary to generate thumbnail
      thumbnailUrl = cloudinary.url(cloudinaryPublicId, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [
          { width: 400, height: 225, crop: 'fill' },
          { quality: 'auto' }
        ]
      });
      console.log('Generated thumbnail URL:', thumbnailUrl);
    } else {
      // Fallback: Use a placeholder or video's secure URL
      thumbnailUrl = secureUrl.replace(/\.(mp4|mov|avi)$/, '.jpg') || 
                    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v${Date.now()}/video-placeholder.jpg`;
    }

    // Create video solution record
    const videoSolutionData = {
      problemId,
      userId,
      cloudinaryPublicId,
      secureUrl,
      duration: cloudinaryResource?.duration || duration || 0,
      thumbnailUrl
    };

    console.log('Creating video solution with data:', videoSolutionData);

    const videoSolution = await SolutionVideo.create(videoSolutionData);

    console.log('Video solution created successfully:', videoSolution._id);

    res.status(201).json({
      message: 'Video solution saved successfully',
      videoSolution: {
        id: videoSolution._id,
        thumbnailUrl: videoSolution.thumbnailUrl,
        duration: videoSolution.duration,
        uploadedAt: videoSolution.createdAt,
        secureUrl: videoSolution.secureUrl
      }
    });

  } catch (error) {
    console.error('❌ Error in saveVideoMetadata:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      details: error
    });
    
    // Check for specific Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    res.status(500).json({ 
      error: 'Failed to save video metadata',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


export const deleteVideo = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;

    const video = await SolutionVideo.findOneAndDelete({ 
      problemId, 
      userId 
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete from Cloudinary as VIDEO
    await cloudinary.uploader.destroy(video.cloudinaryPublicId, { 
      resource_type: 'video',
      invalidate: true 
    });

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};