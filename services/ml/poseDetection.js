/**
 * Pose Detection Service
 * 
 * Uses TensorFlow.js with MediaPipe BlazePose model to detect human poses
 * Lightweight implementation for Expo React Native compatibility
 */

import * as tf from '@tensorflow/tfjs';

// MediaPipe BlazePose keypoint indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
};

class PoseDetectionService {
  constructor() {
    this.model = null;
    this.isReady = false;
    this.isLoading = false;
  }

  /**
   * Initialize the pose detection model
   * For demo purposes, we'll use a simplified approach with TensorFlow.js
   */
  async initialize() {
    if (this.isReady || this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      // Ensure TensorFlow.js is ready
      await tf.ready();
      
      // For hackathon demo: Use a simplified pose detection approach
      // In production, you'd load the actual MediaPipe BlazePose model
      console.log('TensorFlow.js initialized for pose detection');
      
      this.isReady = true;
    } catch (error) {
      console.error('Failed to initialize pose detection:', error);
      this.isReady = false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Detect poses in an image tensor
   * @param {tf.Tensor} imageTensor - Input image tensor [height, width, 3]
   * @returns {Array} Array of pose detections with keypoints
   */
  async detectPoses(imageTensor) {
    if (!this.isReady) {
      await this.initialize();
    }

    try {
      // For demo: Simulate pose detection with mock keypoints
      // In production, this would use the actual MediaPipe model
      const poses = this.generateMockPose(imageTensor);
      return poses;
    } catch (error) {
      console.error('Pose detection failed:', error);
      return [];
    }
  }

  /**
   * Generate mock pose data for demo purposes
   * @param {tf.Tensor} imageTensor 
   * @returns {Array} Mock pose data
   */
  generateMockPose(imageTensor) {
    const shape = imageTensor.shape;
    const height = shape[0];
    const width = shape[1];
    
    // Generate realistic mock keypoints for sit-up position
    const keypoints = [];
    
    // Head area (around center-top)
    keypoints[POSE_LANDMARKS.NOSE] = { x: width * 0.5, y: height * 0.3, visibility: 0.9 };
    keypoints[POSE_LANDMARKS.LEFT_EYE] = { x: width * 0.45, y: height * 0.28, visibility: 0.85 };
    keypoints[POSE_LANDMARKS.RIGHT_EYE] = { x: width * 0.55, y: height * 0.28, visibility: 0.85 };
    keypoints[POSE_LANDMARKS.LEFT_EAR] = { x: width * 0.4, y: height * 0.3, visibility: 0.8 };
    keypoints[POSE_LANDMARKS.RIGHT_EAR] = { x: width * 0.6, y: height * 0.3, visibility: 0.8 };
    
    // Shoulders
    keypoints[POSE_LANDMARKS.LEFT_SHOULDER] = { x: width * 0.35, y: height * 0.4, visibility: 0.9 };
    keypoints[POSE_LANDMARKS.RIGHT_SHOULDER] = { x: width * 0.65, y: height * 0.4, visibility: 0.9 };
    
    // Hips
    keypoints[POSE_LANDMARKS.LEFT_HIP] = { x: width * 0.4, y: height * 0.65, visibility: 0.85 };
    keypoints[POSE_LANDMARKS.RIGHT_HIP] = { x: width * 0.6, y: height * 0.65, visibility: 0.85 };
    
    // Add some randomness to simulate movement
    const time = Date.now();
    const wiggle = Math.sin(time / 1000) * 0.02; // Small movement simulation
    
    Object.keys(keypoints).forEach(idx => {
      if (keypoints[idx]) {
        keypoints[idx].x += width * wiggle;
        keypoints[idx].y += height * wiggle * 0.5;
      }
    });

    return [{
      keypoints,
      score: 0.85 // Confidence score
    }];
  }

  /**
   * Calculate angle between three points
   * @param {Object} pointA 
   * @param {Object} pointB - vertex point
   * @param {Object} pointC 
   * @returns {number} Angle in degrees
   */
  calculateAngle(pointA, pointB, pointC) {
    if (!pointA || !pointB || !pointC) return null;
    
    const vectorBA = {
      x: pointA.x - pointB.x,
      y: pointA.y - pointB.y
    };
    
    const vectorBC = {
      x: pointC.x - pointB.x,
      y: pointC.y - pointB.y
    };
    
    const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;
    const magnitudeBA = Math.sqrt(vectorBA.x ** 2 + vectorBA.y ** 2);
    const magnitudeBC = Math.sqrt(vectorBC.x ** 2 + vectorBC.y ** 2);
    
    const cosAngle = dotProduct / (magnitudeBA * magnitudeBC);
    const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    
    return (angleRad * 180) / Math.PI;
  }

  /**
   * Check if face/head is visible in the pose
   * @param {Object} pose 
   * @returns {boolean} 
   */
  isFaceVisible(pose) {
    if (!pose || !pose.keypoints) return false;
    
    const nose = pose.keypoints[POSE_LANDMARKS.NOSE];
    const leftEye = pose.keypoints[POSE_LANDMARKS.LEFT_EYE];
    const rightEye = pose.keypoints[POSE_LANDMARKS.RIGHT_EYE];
    
    // Check if key facial landmarks are visible with sufficient confidence
    const minVisibility = 0.5;
    
    return nose?.visibility > minVisibility || 
           (leftEye?.visibility > minVisibility && rightEye?.visibility > minVisibility);
  }

  /**
   * Get torso angle for sit-up detection
   * @param {Object} pose 
   * @returns {number|null} Angle in degrees
   */
  getTorsoAngle(pose) {
    if (!pose || !pose.keypoints) return null;
    
    const nose = pose.keypoints[POSE_LANDMARKS.NOSE];
    const leftShoulder = pose.keypoints[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = pose.keypoints[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = pose.keypoints[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = pose.keypoints[POSE_LANDMARKS.RIGHT_HIP];
    
    if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      return null;
    }
    
    // Calculate center points
    const shoulderCenter = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };
    
    const hipCenter = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    };
    
    // Calculate torso angle relative to vertical
    const torsoVector = {
      x: shoulderCenter.x - hipCenter.x,
      y: shoulderCenter.y - hipCenter.y
    };
    
    const verticalVector = { x: 0, y: -1 }; // Pointing up
    
    const dotProduct = torsoVector.x * verticalVector.x + torsoVector.y * verticalVector.y;
    const magnitude = Math.sqrt(torsoVector.x ** 2 + torsoVector.y ** 2);
    
    const cosAngle = dotProduct / magnitude;
    const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    
    return (angleRad * 180) / Math.PI;
  }

  /**
   * Cleanup resources
   */
  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isReady = false;
  }
}

// Export singleton instance
export const poseDetectionService = new PoseDetectionService();
export default poseDetectionService;