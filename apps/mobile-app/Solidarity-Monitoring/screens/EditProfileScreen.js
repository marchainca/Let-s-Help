import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import CryptoJS from 'crypto-js';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { CameraPermissionContext } from '../context/CameraPermissionContext';
import { apiFetch } from '../api/apiClient';

const EditProfileScreen = () => {
  const { t } = useTranslation();
  const { hasCameraPermission } = useContext(CameraPermissionContext);
  const cameraRef = useRef(null);

  const parseDate = (dateString) => {
    if (!dateString) return new Date();

    if (dateString instanceof Date && !isNaN(dateString)) {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      if (!isNaN(date)) return date;
    } catch (error) {
      console.error('Error al convertir la fecha:', error);
    }

    return new Date();
  };

  const { user, updateUser } = useContext(UserContext);
  const [profileImage, setProfileImage] = useState(user?.profileImageUrl || '');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [idNumber, setIdNumber] = useState(user?.idNumber || '');
  const [birthdate, setBirthdate] = useState(parseDate(user?.birthdate));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCameraVisible, setIsCameraVisible] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) setBirthdate(selectedDate);
  };

  const handleSelectFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(t('common.permissionDenied'), t('editProfile.imagePermissionRequired'));
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!pickerResult.canceled) {
        setProfileImage(`data:image/jpeg;base64,${pickerResult.assets[0].base64}`);
        Alert.alert(t('common.success'), t('editProfile.imageUpdated'));
      }
    } catch (error) {
      console.error('Error al cambiar la imagen de perfil:', error);
      Alert.alert(t('common.error'), t('editProfile.imageUpdateFailed'));
    }
  };

  const handleTakePhoto = () => {
    if (!hasCameraPermission) {
      Alert.alert(t('common.permissionDenied'), t('faceRecognition.cameraPermissionDenied'));
      return;
    }
    setIsCameraVisible(true);
  };

  const handleCapturePhoto = async () => {
    try {
      if (!cameraRef.current) {
        throw new Error(t('newMember.cameraAccessFailed'));
      }

      const capturedPhoto = await cameraRef.current.takePictureAsync({ base64: true });
      setProfileImage(`data:image/jpeg;base64,${capturedPhoto.base64}`);
      setIsCameraVisible(false);
      Alert.alert(t('common.success'), t('editProfile.imageUpdated'));
    } catch (error) {
      console.error('Error al capturar foto:', error);
      Alert.alert(t('common.error'), t('newMember.captureFailed'));
    }
  };

  const handleChangeImage = () => {
    Alert.alert(t('userManagement.selectPhoto'), '', [
      { text: t('userManagement.takePhoto'), onPress: handleTakePhoto },
      { text: t('userManagement.chooseFromGallery'), onPress: handleSelectFromGallery },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleSaveChanges = async () => {
    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('editProfile.passwordMismatch'));
      return;
    }

    const updatedData = {};
    if (profileImage !== user?.profileImageUrl) updatedData.urlImage = profileImage;
    if (name !== user?.name) updatedData.name = name;
    if (email !== user?.email) updatedData.email = email;
    if (idNumber !== user?.idNumber) updatedData.idNumber = idNumber;
    if (birthdate.toISOString().split('T')[0] !== user?.birthdate) {
      updatedData.birthdate = birthdate.toISOString().split('T')[0];
    }
    if (password) updatedData.password = CryptoJS.SHA256(password).toString();

    if (Object.keys(updatedData).length === 0) {
      Alert.alert(t('common.noChanges'), t('editProfile.noChangesToSave'));
      return;
    }

    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}users/${idNumber}`;
      const response = await apiFetch(apiUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        Alert.alert(t('common.success'), t('editProfile.profileUpdated'));
        updateUser({
          ...updatedData,
          ...(updatedData.urlImage ? { profileImageUrl: updatedData.urlImage } : {}),
        });
      } else {
        const errorData = await response.json();
        Alert.alert(
          t('common.error'),
          t('editProfile.updateFailed', { message: errorData.message })
        );
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      Alert.alert(t('common.error'), t('common.serverConnectionError'));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('editProfile.title')}</Text>

      <TouchableOpacity onPress={handleChangeImage}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <Text style={styles.changeImageText}>{t('editProfile.changeImage')}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>{t('common.name')}</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>{t('common.email')}</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>{t('common.identificationNumber')}</Text>
      <TextInput
        style={styles.input}
        value={idNumber}
        onChangeText={setIdNumber}
        keyboardType="numeric"
      />

      <Text style={styles.label}>{t('common.birthdate')}</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() =>
          DateTimePickerAndroid.open({ value: birthdate, onChange: handleDateChange })
        }
      >
        <Text>
          {birthdate instanceof Date ? birthdate.toISOString().split('T')[0] : ''}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>{t('editProfile.newPassword')}</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>{t('editProfile.confirmPassword')}</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>{t('editProfile.saveChanges')}</Text>
      </TouchableOpacity>

      <Modal visible={isCameraVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <CameraView style={styles.camera} ref={cameraRef} facing="front">
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureButton} onPress={handleCapturePhoto}>
                <Text style={styles.captureButtonText}>{t('newMember.capture')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsCameraVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  changeImageText: {
    color: '#007BFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditProfileScreen;
