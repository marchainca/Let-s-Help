import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera } from 'expo-camera';

const TestCameraScreen = () => {
  const cameraRef = useRef(null);

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
});

export default TestCameraScreen;
