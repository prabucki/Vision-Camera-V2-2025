/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import {Camera, useCameraDevices, useFrameProcessor} from 'react-native-vision-camera';
import { scanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { runOnJS } from 'react-native-reanimated';

function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;
  const [barcodes, setBarcodes] = useState([]);

  // const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
  //   checkInverted: true,
  // });

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const detectedBarcodes = scanBarcodes(frame, [BarcodeFormat.QR_CODE], { checkInverted: true });
    runOnJS(setBarcodes)(detectedBarcodes);
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

  console.log('Detected Barcodes:', barcodes);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{color: 'white', position: 'absolute', top: 50, left: 20, zIndex: 1}}>Camera Active</Text>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 18,
    color: '#000',
    marginTop: 50,
  },
});

export default App;
