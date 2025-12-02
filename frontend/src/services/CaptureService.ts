// VETRA Depth Recorder - Capture Service
// Handles camera capture, sensor data collection, and file management
// Replaces ARCore functionality with Expo-compatible alternatives

import * as FileSystem from 'expo-file-system';
import { CameraView } from 'expo-camera';
import {
  Accelerometer,
  Gyroscope,
  Magnetometer,
  DeviceMotion,
  AccelerometerMeasurement,
  GyroscopeMeasurement,
  MagnetometerMeasurement,
  DeviceMotionMeasurement,
} from 'expo-sensors';
import { Platform } from 'react-native';

// Types for capture service
export interface SupportInfo {
  cameraAvailable: boolean;
  sensorsAvailable: boolean;
  depthSupported: boolean; // Always false for now (simulated)
  message: string;
}

export interface CameraIntrinsics {
  fx: number; // Focal length x (estimated)
  fy: number; // Focal length y (estimated)
  cx: number; // Principal point x
  cy: number; // Principal point y
  imageWidth: number;
  imageHeight: number;
}

export interface DevicePose {
  // Quaternion (x, y, z, w)
  quaternion: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  // Translation (estimated from accelerometer integration)
  translation: {
    x: number;
    y: number;
    z: number;
  };
  // Rotation matrix (3x3 flattened to 9 elements, row-major)
  rotationMatrix: number[];
  // Full 4x4 transform matrix (row-major)
  transformMatrix4x4: number[];
}

export interface SensorData {
  accelerometer: AccelerometerMeasurement | null;
  gyroscope: GyroscopeMeasurement | null;
  magnetometer: MagnetometerMeasurement | null;
  deviceMotion: DeviceMotionMeasurement | null;
  timestamp: number;
}

export interface FrameCaptureResult {
  frameId: string;
  imagePath: string;
  metaPath: string;
  thumbnailPath?: string;
  depthPath?: string; // Will be null (depth simulation placeholder)
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface FrameMetadata {
  frameId: string;
  sessionId: string;
  viewLabel: string;
  timestampMs: number;
  timestampIso: string;
  image: {
    path: string;
    width: number;
    height: number;
    format: string;
  };
  depth: {
    available: boolean;
    path: string | null;
    width: number | null;
    height: number | null;
    format: string | null;
    units: string | null;
  };
  intrinsics: CameraIntrinsics;
  pose: DevicePose;
  sensors: SensorData;
  device: {
    platform: string;
    model: string;
  };
}

// Singleton class for capture management
class CaptureServiceClass {
  private isSessionActive: boolean = false;
  private currentSessionId: string | null = null;
  private frameCounter: number = 0;
  private baseDirectory: string = '';
  
  // Sensor data storage
  private latestSensorData: SensorData = {
    accelerometer: null,
    gyroscope: null,
    magnetometer: null,
    deviceMotion: null,
    timestamp: 0,
  };
  
  // Sensor subscriptions
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private magnetometerSubscription: any = null;
  private deviceMotionSubscription: any = null;

  // Default camera intrinsics (estimated for typical smartphone)
  private defaultIntrinsics: CameraIntrinsics = {
    fx: 1000, // Estimated focal length
    fy: 1000,
    cx: 540,  // Assuming 1080p center
    cy: 960,
    imageWidth: 1080,
    imageHeight: 1920,
  };

  constructor() {
    this.baseDirectory = `${FileSystem.documentDirectory}VETRA_DATA/`;
  }

  /**
   * Check device support for camera and sensors
   */
  async checkSupport(): Promise<SupportInfo> {
    try {
      // Check accelerometer availability
      const accelAvailable = await Accelerometer.isAvailableAsync();
      const gyroAvailable = await Gyroscope.isAvailableAsync();
      
      return {
        cameraAvailable: true, // Camera is generally available
        sensorsAvailable: accelAvailable && gyroAvailable,
        depthSupported: false, // True depth not available without ARCore
        message: accelAvailable && gyroAvailable
          ? 'Camera and motion sensors available. Depth capture simulated.'
          : 'Camera available. Some sensors may be limited.',
      };
    } catch (error) {
      return {
        cameraAvailable: false,
        sensorsAvailable: false,
        depthSupported: false,
        message: `Error checking support: ${error}`,
      };
    }
  }

  /**
   * Start a capture session
   */
  async startSession(sessionId: string): Promise<boolean> {
    try {
      this.currentSessionId = sessionId;
      this.frameCounter = 0;
      this.isSessionActive = true;

      // Create session directory
      const sessionDir = `${this.baseDirectory}session_${sessionId}/`;
      await FileSystem.makeDirectoryAsync(sessionDir, { intermediates: true });

      // Start sensor subscriptions
      await this.startSensorTracking();

      console.log(`[CaptureService] Session started: ${sessionId}`);
      return true;
    } catch (error) {
      console.error('[CaptureService] Failed to start session:', error);
      return false;
    }
  }

  /**
   * Start tracking device sensors
   */
  private async startSensorTracking(): Promise<void> {
    const updateInterval = 100; // 10Hz update rate

    // Accelerometer
    try {
      Accelerometer.setUpdateInterval(updateInterval);
      this.accelerometerSubscription = Accelerometer.addListener((data) => {
        this.latestSensorData.accelerometer = data;
        this.latestSensorData.timestamp = Date.now();
      });
    } catch (e) {
      console.warn('[CaptureService] Accelerometer not available');
    }

    // Gyroscope
    try {
      Gyroscope.setUpdateInterval(updateInterval);
      this.gyroscopeSubscription = Gyroscope.addListener((data) => {
        this.latestSensorData.gyroscope = data;
      });
    } catch (e) {
      console.warn('[CaptureService] Gyroscope not available');
    }

    // Magnetometer
    try {
      Magnetometer.setUpdateInterval(updateInterval);
      this.magnetometerSubscription = Magnetometer.addListener((data) => {
        this.latestSensorData.magnetometer = data;
      });
    } catch (e) {
      console.warn('[CaptureService] Magnetometer not available');
    }

    // Device Motion (provides orientation)
    try {
      DeviceMotion.setUpdateInterval(updateInterval);
      this.deviceMotionSubscription = DeviceMotion.addListener((data) => {
        this.latestSensorData.deviceMotion = data;
      });
    } catch (e) {
      console.warn('[CaptureService] DeviceMotion not available');
    }
  }

  /**
   * Stop sensor tracking
   */
  private stopSensorTracking(): void {
    this.accelerometerSubscription?.remove();
    this.gyroscopeSubscription?.remove();
    this.magnetometerSubscription?.remove();
    this.deviceMotionSubscription?.remove();
    
    this.accelerometerSubscription = null;
    this.gyroscopeSubscription = null;
    this.magnetometerSubscription = null;
    this.deviceMotionSubscription = null;
  }

  /**
   * Calculate device pose from sensor data
   */
  private calculatePose(): DevicePose {
    const motion = this.latestSensorData.deviceMotion;
    
    // Default identity pose
    let quaternion = { x: 0, y: 0, z: 0, w: 1 };
    let translation = { x: 0, y: 0, z: 0 };
    
    if (motion?.rotation) {
      // Use device motion rotation (quaternion)
      quaternion = {
        x: motion.rotation.beta / 180 * Math.PI, // Convert to radians-ish
        y: motion.rotation.gamma / 180 * Math.PI,
        z: motion.rotation.alpha / 180 * Math.PI,
        w: 1, // Simplified
      };
      
      // Normalize quaternion
      const mag = Math.sqrt(
        quaternion.x ** 2 + quaternion.y ** 2 + quaternion.z ** 2 + quaternion.w ** 2
      );
      if (mag > 0) {
        quaternion.x /= mag;
        quaternion.y /= mag;
        quaternion.z /= mag;
        quaternion.w /= mag;
      }
    }

    // Calculate rotation matrix from quaternion
    const { x, y, z, w } = quaternion;
    const rotationMatrix = [
      1 - 2*y*y - 2*z*z, 2*x*y - 2*z*w, 2*x*z + 2*y*w,
      2*x*y + 2*z*w, 1 - 2*x*x - 2*z*z, 2*y*z - 2*x*w,
      2*x*z - 2*y*w, 2*y*z + 2*x*w, 1 - 2*x*x - 2*y*y,
    ];

    // Build 4x4 transform matrix (row-major)
    const transformMatrix4x4 = [
      rotationMatrix[0], rotationMatrix[1], rotationMatrix[2], translation.x,
      rotationMatrix[3], rotationMatrix[4], rotationMatrix[5], translation.y,
      rotationMatrix[6], rotationMatrix[7], rotationMatrix[8], translation.z,
      0, 0, 0, 1,
    ];

    return {
      quaternion,
      translation,
      rotationMatrix,
      transformMatrix4x4,
    };
  }

  /**
   * Capture a frame with the camera
   */
  async captureFrame(
    cameraRef: React.RefObject<CameraView>,
    viewLabel: string
  ): Promise<FrameCaptureResult> {
    if (!this.isSessionActive || !this.currentSessionId) {
      return {
        frameId: '',
        imagePath: '',
        metaPath: '',
        timestamp: Date.now(),
        success: false,
        error: 'No active session',
      };
    }

    if (!cameraRef.current) {
      return {
        frameId: '',
        imagePath: '',
        metaPath: '',
        timestamp: Date.now(),
        success: false,
        error: 'Camera not ready',
      };
    }

    try {
      this.frameCounter++;
      const frameId = `frame_${String(this.frameCounter).padStart(4, '0')}`;
      const timestamp = Date.now();

      // Create frame directory
      const frameDir = `${this.baseDirectory}session_${this.currentSessionId}/${frameId}/`;
      await FileSystem.makeDirectoryAsync(frameDir, { intermediates: true });

      // Capture image
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: true,
        exif: true,
      });

      if (!photo) {
        throw new Error('Failed to capture photo');
      }

      // Save image
      const imagePath = `${frameDir}rgb.jpg`;
      await FileSystem.copyAsync({
        from: photo.uri,
        to: imagePath,
      });

      // Get pose and sensor data
      const pose = this.calculatePose();
      const sensorData = { ...this.latestSensorData };

      // Update intrinsics based on actual image size
      const intrinsics: CameraIntrinsics = {
        ...this.defaultIntrinsics,
        imageWidth: photo.width,
        imageHeight: photo.height,
        cx: photo.width / 2,
        cy: photo.height / 2,
        // Estimate focal length based on typical phone FOV (~70 degrees)
        fx: (photo.width / 2) / Math.tan((70 / 2) * Math.PI / 180),
        fy: (photo.width / 2) / Math.tan((70 / 2) * Math.PI / 180),
      };

      // Create metadata
      const metadata: FrameMetadata = {
        frameId,
        sessionId: this.currentSessionId,
        viewLabel,
        timestampMs: timestamp,
        timestampIso: new Date(timestamp).toISOString(),
        image: {
          path: 'rgb.jpg',
          width: photo.width,
          height: photo.height,
          format: 'jpeg',
        },
        depth: {
          available: false,
          path: null,
          width: null,
          height: null,
          format: null,
          units: null,
        },
        intrinsics,
        pose,
        sensors: sensorData,
        device: {
          platform: Platform.OS,
          model: Platform.OS === 'ios' ? 'iPhone' : 'Android',
        },
      };

      // Save metadata
      const metaPath = `${frameDir}meta.json`;
      await FileSystem.writeAsStringAsync(
        metaPath,
        JSON.stringify(metadata, null, 2)
      );

      console.log(`[CaptureService] Frame captured: ${frameId}`);

      return {
        frameId,
        imagePath,
        metaPath,
        timestamp,
        success: true,
      };
    } catch (error) {
      console.error('[CaptureService] Capture failed:', error);
      return {
        frameId: '',
        imagePath: '',
        metaPath: '',
        timestamp: Date.now(),
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * End the current capture session
   */
  async endSession(): Promise<void> {
    this.stopSensorTracking();
    this.isSessionActive = false;
    this.currentSessionId = null;
    this.frameCounter = 0;
    console.log('[CaptureService] Session ended');
  }

  /**
   * Get session directory path
   */
  getSessionDirectory(sessionId: string): string {
    return `${this.baseDirectory}session_${sessionId}/`;
  }

  /**
   * List all frames in a session
   */
  async listSessionFrames(sessionId: string): Promise<string[]> {
    try {
      const sessionDir = this.getSessionDirectory(sessionId);
      const contents = await FileSystem.readDirectoryAsync(sessionDir);
      return contents.filter(name => name.startsWith('frame_')).sort();
    } catch (error) {
      console.error('[CaptureService] Failed to list frames:', error);
      return [];
    }
  }

  /**
   * Read frame metadata
   */
  async readFrameMetadata(sessionId: string, frameId: string): Promise<FrameMetadata | null> {
    try {
      const metaPath = `${this.getSessionDirectory(sessionId)}${frameId}/meta.json`;
      const content = await FileSystem.readAsStringAsync(metaPath);
      return JSON.parse(content);
    } catch (error) {
      console.error('[CaptureService] Failed to read metadata:', error);
      return null;
    }
  }

  /**
   * Get current frame count
   */
  getFrameCount(): number {
    return this.frameCounter;
  }

  /**
   * Check if session is active
   */
  isActive(): boolean {
    return this.isSessionActive;
  }
}

// Export singleton instance
export const CaptureService = new CaptureServiceClass();
