import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

const BenchmarkOverlay = ({ frameProcessorFps, device, frameCount, processingTime }) => {
  const [fps, setFps] = useState(0);
  const [avgProcessingTime, setAvgProcessingTime] = useState(0);
  const [resolution, setResolution] = useState('Unknown');
  const [deviceInfo, setDeviceInfo] = useState('Unknown');
  const [frameStats, setFrameStats] = useState({
    totalFrames: 0,
    processedFrames: 0,
    successRate: 0,
  });

  const fpsHistory = useRef([]);
  const processingTimeHistory = useRef([]);
  const lastFrameTime = useRef(Date.now());
  const frameCounter = useRef(0);

  useEffect(() => {
    // Calculate FPS based on frame processor calls
    const now = Date.now();
    const timeDiff = now - lastFrameTime.current;

    if (timeDiff > 0) {
      const currentFps = 1000 / timeDiff;
      fpsHistory.current.push(currentFps);

      // Keep only last 30 measurements for smoothing
      if (fpsHistory.current.length > 30) {
        fpsHistory.current.shift();
      }

      // Calculate average FPS
      const avgFps = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;
      setFps(Math.round(avgFps * 10) / 10);
    }

    lastFrameTime.current = now;
    frameCounter.current++;
  }, [frameCount]);

  useEffect(() => {
    // Track processing time
    if (processingTime > 0) {
      processingTimeHistory.current.push(processingTime);

      // Keep only last 30 measurements
      if (processingTimeHistory.current.length > 30) {
        processingTimeHistory.current.shift();
      }

      // Calculate average processing time
      const avgTime = processingTimeHistory.current.reduce((a, b) => a + b, 0) / processingTimeHistory.current.length;
      setAvgProcessingTime(Math.round(avgTime * 100) / 100);
    }
  }, [processingTime]);

  useEffect(() => {
    // Extract device and resolution info
    if (device) {
      const deviceName = device.name || 'Unknown Camera';
      const deviceType = device.position || 'Unknown';
      setDeviceInfo(`${deviceName} (${deviceType})`);

      // Try to get resolution info
      if (device.formats && device.formats.length > 0) {
        const format = device.formats[0];
        if (format.videoWidth && format.videoHeight) {
          setResolution(`${format.videoWidth}x${format.videoHeight}`);
        }
      }
    }
  }, [device]);

  useEffect(() => {
    // Update frame statistics
    setFrameStats(prev => ({
      totalFrames: frameCounter.current,
      processedFrames: prev.processedFrames + (frameCount > 0 ? 1 : 0),
      successRate: frameCounter.current > 0 ? Math.round((prev.processedFrames / frameCounter.current) * 100) : 0,
    }));
  }, [frameCount]);

  const getFpsColor = (fps) => {
    if (fps >= 25) return '#4CAF50'; // Green
    if (fps >= 15) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getProcessingTimeColor = (time) => {
    if (time <= 50) return '#4CAF50'; // Green
    if (time <= 100) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <View style={[styles.container]}>
      <View style={styles.benchmarkPanel}>

                <View style={styles.metricsContainer}>
          {/* Top Row - Performance Metrics */}
          <View style={styles.metricsRow}>
            {/* FPS Metric */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>FPS</Text>
                <Text style={[styles.metricValue, { color: getFpsColor(fps) }]}>
                  {fps.toFixed(1)}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((fps / 30) * 100, 100)}%`,
                      backgroundColor: getFpsColor(fps)
                    }
                  ]}
                />
              </View>
              <Text style={styles.metricSubtext}>Target: {frameProcessorFps}</Text>
            </View>

            {/* Processing Time Metric */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Processing</Text>
                <Text style={[styles.metricValue, { color: getProcessingTimeColor(avgProcessingTime) }]}>
                  {avgProcessingTime.toFixed(1)}ms
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((avgProcessingTime / 200) * 100, 100)}%`,
                      backgroundColor: getProcessingTimeColor(avgProcessingTime)
                    }
                  ]}
                />
              </View>
              <Text style={styles.metricSubtext}>Lower is better</Text>
            </View>
          </View>

          {/* Bottom Row - Device Info */}
          <View style={styles.infoRow}>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>Resolution: </Text>
              <Text style={styles.infoValue}>{resolution}</Text>
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>Frames: </Text>
              <Text style={styles.infoValue}>{frameStats.totalFrames}</Text>
            </Text>
            <Text style={styles.infoItem} numberOfLines={1} ellipsizeMode="tail">
              <Text style={styles.infoLabel}>Device: </Text>
              <Text style={styles.infoValue}>{deviceInfo}</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  benchmarkPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  metricsContainer: {
    gap: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flex: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  metricSubtext: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoItem: {
    flex: 1,
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.7,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 11,
    color: '#fff',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});

export default BenchmarkOverlay;
