/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface SensorOptions {
  threshold?: number;
  cooldown?: number;
  onStep?: () => void;
}

export function useSensorTracking({ threshold = 1.2, cooldown = 450, onStep }: SensorOptions = {}) {
  const [isActive, setIsActive] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const lastStepTime = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // For improved accuracy: rolling magnitude to filter noise
  const magnitudeBuffer = useRef<number[]>([]);
  const BUFFER_SIZE = 5;

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    // We use acceleration including gravity and filter it
    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    const magnitude = Math.sqrt(x * x + y * y + z * z);
    
    // Simple low-pass filter
    magnitudeBuffer.current.push(magnitude);
    if (magnitudeBuffer.current.length > BUFFER_SIZE) {
      magnitudeBuffer.current.shift();
    }
    
    const avgMagnitude = magnitudeBuffer.current.reduce((a, b) => a + b, 0) / magnitudeBuffer.current.length;
    
    // Gravity is roughly 9.8 m/s^2. We look for a deviation from this.
    // Typical walking peak is 1.5 - 2.5 m/s^2 deviation from gravity.
    const deviation = Math.abs(avgMagnitude - 9.80665);

    const now = Date.now();
    if (deviation > threshold && (now - lastStepTime.current) > cooldown) {
      lastStepTime.current = now;
      if (onStep) onStep();
    }
  }, [threshold, cooldown, onStep]);

  const startTracking = async () => {
    try {
      // Handle iOS 13+ permission request
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionStatus('granted');
          window.addEventListener('devicemotion', handleMotion);
          setIsActive(true);
        } else {
          setPermissionStatus('denied');
          setError('Permission denied for motion sensors');
        }
      } else {
        // Standard browsers
        setPermissionStatus('granted');
        window.addEventListener('devicemotion', handleMotion);
        setIsActive(true);
      }
    } catch (err) {
      setError('Motion sensors are not supported on this device or connection.');
      console.error(err);
    }
  };

  const stopTracking = () => {
    window.removeEventListener('devicemotion', handleMotion);
    setIsActive(false);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [handleMotion]);

  return { isActive, startTracking, stopTracking, permissionStatus, error };
}
