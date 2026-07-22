import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CryptoJS from 'crypto-js';
import { Picker } from '@react-native-picker/picker';
import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { CameraPermissionContext } from '../context/CameraPermissionContext';
import { apiFetch } from '../api/apiClient';

const UserManagementScreen = () => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const { hasCameraPermission } = useContext(CameraPermissionContext);
  const cameraRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [isCameraVisible, setIsCameraVisible] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setBirthday(formattedDate);
    }
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
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
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
    } catch (error) {
      console.error('Error al capturar foto:', error);
      Alert.alert(t('common.error'), t('newMember.captureFailed'));
    }
  };

  const handleSelectPhoto = () => {
    Alert.alert(t('userManagement.selectPhoto'), '', [
      { text: t('userManagement.takePhoto'), onPress: handleTakePhoto },
      { text: t('userManagement.chooseFromGallery'), onPress: handleSelectFromGallery },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const resetForm = () => {
    setEmail('');
    setName('');
    setIdNumber('');
    setPassword('');
    setBirthday('');
    setGender('');
    setProfileImage('');
  };

  const registerUser = async () => {
    if (!email || !name || !idNumber || !password || !birthday || !gender) {
      Alert.alert(t('common.error'), t('common.allFieldsRequired'));
      return;
    }

    if (!profileImage) {
      Alert.alert(t('common.error'), t('userManagement.photoRequired'));
      return;
    }

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL + 'users';
      const response = await apiFetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          name,
          email,
          idNumber,
          birthdate: birthday,
          urlImage: profileImage,
          password: CryptoJS.SHA256(password).toString(),
          gender,
          role: 'Admin',
        }),
      });
      const dataResponse = await response.json();
      if (response.ok) {
        Alert.alert(t('common.success'), t('userManagement.userRegistered'));
        setUsers([
          ...users,
          {
            id: Date.now().toString(),
            name,
            email,
            idNumber,
            birthday,
            gender,
          },
        ]);
        resetForm();
      } else {
        Alert.alert(
          t('common.error'),
          dataResponse.message || t('userManagement.registerFailed')
        );
      }
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      Alert.alert(t('common.error'), t('common.serverConnectionErrorShort'));
    }
  };

  const removeUser = (id) => {
    setUsers(users.filter((userItem) => userItem.id !== id));
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{t('userManagement.title')}</Text>

        <Text style={styles.label}>{t('userManagement.profilePhoto')}</Text>
        <TouchableOpacity style={styles.photoSection} onPress={handleSelectPhoto}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>{t('userManagement.selectPhoto')}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={t('common.identificationNumber')}
          value={idNumber}
          onChangeText={setIdNumber}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder={t('userManagement.fullNamePlaceholder')}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder={t('common.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Picker
          selectedValue={gender}
          style={styles.picker}
          onValueChange={(itemValue) => setGender(itemValue)}
        >
          <Picker.Item label={t('userManagement.selectGender')} value="" />
          <Picker.Item label={t('userManagement.genderMale')} value="M" />
          <Picker.Item label={t('userManagement.genderFemale')} value="F" />
          <Picker.Item label={t('userManagement.genderOther')} value="O" />
        </Picker>

        <TextInput
          style={styles.input}
          placeholder={t('common.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>
            {birthday ? birthday : t('userManagement.selectBirthdate')}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={registerUser}>
          <Text style={styles.buttonText}>{t('userManagement.registerUser')}</Text>
        </TouchableOpacity>

        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <Text>{item.email}</Text>
              <TouchableOpacity onPress={() => removeUser(item.id)}>
                <Text style={styles.removeButton}>{t('common.delete')}</Text>
              </TouchableOpacity>
            </View>
          )}
        />

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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  photoPlaceholderText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  picker: {
    height: 52,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  dateText: {
    color: '#000',
  },
  button: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  removeButton: {
    color: 'red',
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

export default UserManagementScreen;
