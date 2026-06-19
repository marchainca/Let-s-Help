import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CameraView } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { CameraPermissionContext } from '../context/CameraPermissionContext';
import { UserContext } from '../context/UserContext';

const DOC_TYPE_CITIZENSHIP = 'Cédula de ciudadanía';

const NewMemberScreen = () => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [facing] = useState('front');
  const { hasCameraPermission, setErrorMessage } = useContext(CameraPermissionContext);
  const cameraRef = React.useRef(null);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [docType, setDocType] = useState(DOC_TYPE_CITIZENSHIP);
  const [docNumber, setDocNumber] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoBase64, setPhotoBase64] = useState('');

  const docTypes = [
    { value: 'Tarjeta de identidad', labelKey: 'newMember.docTypeIdentityCard' },
    { value: DOC_TYPE_CITIZENSHIP, labelKey: 'newMember.docTypeCitizenship' },
    { value: 'Registro civil', labelKey: 'newMember.docTypeCivilRegistry' },
  ];

  useEffect(() => {
    if (hasCameraPermission === null || hasCameraPermission === false) {
      setErrorMessage(t('faceRecognition.cameraPermissionDenied'));
    }
  }, [hasCameraPermission, setErrorMessage, t]);

  const handleFacialTraining = async () => {
    setIsCameraVisible(true);
  };

  const handleCapture = async () => {
    try {
      if (cameraRef.current) {
        const capturedPhoto = await cameraRef.current.takePictureAsync({ base64: true });
        setPhotoBase64(capturedPhoto.base64);
        setIsCameraVisible(false);
        setIsUploading(true);
      } else {
        throw new Error(t('newMember.cameraAccessFailed'));
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('common.error'), t('newMember.captureFailed'));
    }
  };

  const handleSubmit = async () => {
    if (
      !name ||
      !lastName ||
      !email ||
      !docNumber ||
      !address ||
      !neighborhood ||
      !policyNumber ||
      !emergencyContact
    ) {
      Alert.alert(t('common.error'), t('common.completeAllFields'));
      return;
    }

    const requestData = {
      name,
      lastName,
      email,
      documentType: docType,
      documentNumber: docNumber,
      birthdate: birthdate.toISOString().split('T')[0],
      address,
      neighborhood,
      policyNumber,
      emergencyContact,
      imageBase64: `data:image/jpg;base64,${photoBase64}`,
    };

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL + 'recognition/register';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        Alert.alert(t('common.success'), t('newMember.memberRegistered'));
      } else {
        const errorData = await response.json();
        Alert.alert(
          t('common.error'),
          t('newMember.registerFailed', { message: errorData.message })
        );
      }
    } catch (error) {
      console.error('Error al registrar el integrante:', error);
      Alert.alert(t('common.error'), t('common.serverConnectionError'));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('newMember.title')}</Text>

        <Text style={styles.label}>{t('common.documentType')}</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={docType}
            onValueChange={(itemValue) => setDocType(itemValue)}
            style={styles.picker}
          >
            {docTypes.map((type) => (
              <Picker.Item key={type.value} label={t(type.labelKey)} value={type.value} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>{t('common.documentNumber')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('newMember.documentNumberPlaceholder')}
          keyboardType="number-pad"
          value={docNumber}
          onChangeText={setDocNumber}
        />

        <Text style={styles.label}>{t('common.firstName')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('newMember.firstNamePlaceholder')}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>{t('common.lastNames')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('newMember.lastNamePlaceholder')}
          value={lastName}
          onChangeText={setLastName}
        />

        <Text style={styles.label}>{t('common.birthdate')}</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text>{birthdate.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthdate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Text style={styles.label}>{t('common.email')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('newMember.emailPlaceholder')}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>{t('common.address')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('newMember.addressPlaceholder')}
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>{t('common.neighborhood')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('newMember.neighborhoodPlaceholder')}
          value={neighborhood}
          onChangeText={setNeighborhood}
        />

        <Text style={styles.label}>{t('newMember.policyNumber')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('newMember.policyNumberPlaceholder')}
          keyboardType="number-pad"
          value={policyNumber}
          onChangeText={setPolicyNumber}
        />

        <Text style={styles.label}>{t('newMember.emergencyContact')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('newMember.emergencyContactPlaceholder')}
          keyboardType="number-pad"
          value={emergencyContact}
          onChangeText={setEmergencyContact}
        />

        <TouchableOpacity style={styles.button} onPress={handleFacialTraining}>
          <Text style={styles.buttonText}>{t('newMember.facialTraining')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{t('common.save')}</Text>
        </TouchableOpacity>

        {isUploading && (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
        )}

        <Modal visible={isCameraVisible} animationType="slide" transparent={false}>
          <View style={styles.modalContainer}>
            <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
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
  },
  container: {
    flex: 1,
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
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  captureButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NewMemberScreen;
