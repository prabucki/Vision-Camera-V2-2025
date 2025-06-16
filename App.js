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

import {Camera, useCameraDevices} from 'react-native-vision-camera';

function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;

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
      <Text style={{color: 'white', position: 'absolute', top: 50, left: 20, zIndex: 1}}>Camera Active</Text>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
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
