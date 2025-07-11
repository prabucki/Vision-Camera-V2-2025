/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import {Camera, useCameraDevices, useFrameProcessor} from 'react-native-vision-camera-old';
import { scanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { runOnJS } from 'react-native-reanimated';
import ScanningOverlay from './components/ScanningOverlay';
import BenchmarkOverlay from './components/BenchmarkOverlay';

function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;
  const [barcodes, setBarcodes] = useState([]);
  const [frameCount, setFrameCount] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);

  const frameProcessorFps = 5;

  // Support all barcode formats
  const supportedFormats = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_93,
    BarcodeFormat.CODABAR,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.ITF,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.PDF417,
    BarcodeFormat.AZTEC,
  ];

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const startTime = Date.now();
    const detectedBarcodes = scanBarcodes(frame, supportedFormats, { checkInverted: false });
    const endTime = Date.now();
    const processingTimeMs = endTime - startTime;

    runOnJS(setBarcodes)(detectedBarcodes);
    runOnJS(setFrameCount)(prev => prev + 1);
    runOnJS(setProcessingTime)(processingTimeMs);
  }, []);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const cameraPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (cameraPermission === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          console.log('Camera permission denied');
        }
      } else {
        // For iOS, you would use react-native-vision-camera's permission methods
        const cameraPermission = await Camera.getCameraPermissionStatus();
        if (cameraPermission === 'authorized') {
          setHasPermission(true);
        } else {
          const newCameraPermission = await Camera.requestCameraPermission();
          setHasPermission(newCameraPermission === 'authorized');
        }
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>Camera permission is required</Text>
      </SafeAreaView>
    );
  }

  if (device == null) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>No camera device found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          frameProcessorFps={frameProcessorFps}
        />

        <ScanningOverlay barcodes={barcodes} />
        <BenchmarkOverlay
          frameProcessorFps={frameProcessorFps}
          device={device}
          frameCount={frameCount}
          processingTime={processingTime}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 18,
    color: '#fff',
    marginTop: 50,
  },
});

export default App;
