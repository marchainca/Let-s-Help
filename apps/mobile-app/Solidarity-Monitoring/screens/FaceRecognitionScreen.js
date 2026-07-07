import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { CameraPermissionContext } from '../context/CameraPermissionContext';
import { UserContext } from '../context/UserContext';
import { apiFetch } from '../api/apiClient';

const FaceRecognitionScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [facing] = useState('front');
  const { hasCameraPermission, errorMessage, setErrorMessage } = useContext(CameraPermissionContext);
  const cameraRef = React.useRef(null);
  const { user } = useContext(UserContext);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);

  useEffect(() => {
    if (hasCameraPermission === null || hasCameraPermission === false) {
      setErrorMessage(t('faceRecognition.cameraPermissionDenied'));
    }
  }, [hasCameraPermission, setErrorMessage, t]);

  const handleFaceRecognition = async () => {
    if (!cameraRef.current) {
      setErrorMessage(t('faceRecognition.cameraNotAvailable'));
      return;
    }

    setIsRecognizing(true);

    try {
      const capturedPhoto = await cameraRef.current.takePictureAsync({
        base64: true,
      });

      setIsCameraVisible(false);

      const requestData = {
        imageBase64: capturedPhoto.base64,
      };

      const response = await apiFetch(
        `${process.env.EXPO_PUBLIC_API_URL}recognition/identify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        if (responseData.code == 1) {
          navigation.navigate('AttendanceFormWithData', {
            recognizedData: {
              firstName: responseData.content.data.name,
              lastName: responseData.content.data.lastName,
              age: responseData.content.data.birthdate,
              documentType: responseData.content.data.documentType,
              documentNumber: responseData.content.data.documentNumber,
              email: responseData.content.data.email,
              address: responseData.content.data.address,
              neighborhood: responseData.content.data.neighborhood,
              policy: responseData.content.data.policyNumber,
              emergencyContact: responseData.content.data.emergencyContact,
            },
          });
        } else {
          Alert.alert(t('common.error'), responseData.content.message);
        }
      } else {
        Alert.alert(
          t('common.error'),
          t('faceRecognition.registerMemberFailed', { message: responseData.message })
        );
        setErrorMessage(responseData.message || t('faceRecognition.recognitionError'));
      }
    } catch (error) {
      console.error('Error en el reconocimiento facial:', error);
      setErrorMessage(t('faceRecognition.unexpectedError'));
    } finally {
      setIsRecognizing(false);
    }
  };

  if (hasCameraPermission === false) {
    return (
      <View style={styles.container}>
        <Text>{t('faceRecognition.cameraPermissionRequired')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hasCameraPermission && (
        <CameraView style={styles.camera} ref={cameraRef} facing={facing} />
      )}
      {isRecognizing && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      )}
      <TouchableOpacity style={styles.button} onPress={handleFaceRecognition}>
        <Text style={styles.buttonText}>{t('faceRecognition.startRecognition')}</Text>
      </TouchableOpacity>
      <Modal
        visible={isCameraVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setErrorMessage('')}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setErrorMessage('')}>
              <Text style={styles.modalButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  camera: {
    width: '100%',
    height: '60%',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '45%',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#ff0000',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FaceRecognitionScreen;
