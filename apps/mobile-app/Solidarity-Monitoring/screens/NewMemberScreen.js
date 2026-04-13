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
import { CameraPermissionContext } from '../context/CameraPermissionContext';
import { UserContext } from '../context/UserContext';

const NewMemberScreen = ({ navigation }) => {
  
  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Registro Nuevo Integrante',
    });
  }, []);

  const { user } = useContext(UserContext);
  const [facing, setFacing] = useState('front');
  const { hasCameraPermission, errorMessage, setErrorMessage } = useContext(CameraPermissionContext);
  const cameraRef = React.useRef(null);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [docType, setDocType] = useState('Cédula de ciudadanía');
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
  
 

  useEffect(() => {
    if (hasCameraPermission === null || hasCameraPermission === false) {
      setErrorMessage('Permiso de cámara no concedido. Verifica en los ajustes.');
    }
  }, [hasCameraPermission]);

  const handleFacialTraining = async () => {
    setIsCameraVisible(true);
  };

  const handleCapture = async () => {
    try {
      if (cameraRef.current) {
        //photo = await cameraRef.current.takePictureAsync({ base64: true });
        const capturedPhoto = await cameraRef.current.takePictureAsync({ base64: true });
        
        setPhotoBase64(capturedPhoto.base64); 
        console.log('Captura de foto (Base64):', capturedPhoto);
        setIsCameraVisible(false);
        setIsUploading(true);
      } else {
        throw new Error('No se pudo acceder a la cámara.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo capturar la imagen.');
    }
  };

  const handleSubmit = async () => {
    // Validar los campos requeridos
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
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
  
    // Crear el JSON con los datos del formulario
    const requestData = {
      name,
      lastName,
      email,
      documentType: docType,
      documentNumber: docNumber,
      birthdate: birthdate.toISOString().split('T')[0], // Fecha en formato YYYY-MM-DD
      address,
      neighborhood,
      policyNumber,
      emergencyContact,
      imageBase64: "data:image/jpg;base64," + photoBase64, // Imagen base64 del entrenamiento facial
    };
  
    try {
      // Enviar los datos al backend
      const apiUrl = process.env.EXPO_PUBLIC_API_URL + 'recognition/register' ;
      console.log("Data a enviar", requestData)
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`, // Si es necesario un token
        },
        body: JSON.stringify(requestData),
      });
  
      if (response.ok) {
        Alert.alert('Éxito', 'Integrante registrado correctamente.');
        // Opcional: limpiar los campos del formulario después de un envío exitoso
      } else {
        const errorData = await response.json();
        Alert.alert('Error', `Error al registrar el integrante: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error al registrar el integrante:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
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
        <Text style={styles.title}>Nuevo Integrante</Text>

        <Text style={styles.label}>Tipo de Documento</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={docType}
            onValueChange={(itemValue) => setDocType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Tarjeta de identidad" value="Tarjeta de identidad" />
            <Picker.Item label="Cédula de ciudadanía" value="Cédula de ciudadanía" />
            <Picker.Item label="Registro civil" value="Registro civil" />
          </Picker>
        </View>

        <Text style={styles.label}>Número de Documento</Text>
        <TextInput
          style={styles.input}
          placeholder="Número de Documento"
          keyboardType="number-pad"
          value={docNumber}
          onChangeText={setDocNumber}
        />

        <Text style={styles.label}>Nombres</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombres"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Apellidos</Text>
        <TextInput
          style={styles.input}
          placeholder="Apellidos"
          value={lastName}
          onChangeText={setLastName}
        />

        <Text style={styles.label}>Fecha de Nacimiento</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
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

        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          placeholder="Dirección"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>Barrio</Text>
        <TextInput
          style={styles.input}
          placeholder="Barrio"
          value={neighborhood}
          onChangeText={setNeighborhood}
        />

        <Text style={styles.label}>Número de Póliza</Text>
        <TextInput
          style={styles.input}
          placeholder="Número de Póliza"
          keyboardType="number-pad"
          value={policyNumber}
          onChangeText={setPolicyNumber}
        />

        <Text style={styles.label}>Contacto de Emergencia</Text>
        <TextInput
          style={styles.input}
          placeholder="Número de Emergencia"
          keyboardType="number-pad"
          value={emergencyContact}
          onChangeText={setEmergencyContact}
        />

        <TouchableOpacity style={styles.button} onPress={handleFacialTraining}>
          <Text style={styles.buttonText}>Entrenamiento Facial</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>

        {isUploading && (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
        )}

        {/* Modal de la cámara */}
        <Modal visible={isCameraVisible} animationType="slide" transparent={false}>
          <View style={styles.modalContainer}>
            <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.captureButton} onPress={() => handleCapture()}>
                  <Text style={styles.captureButtonText}>Capturar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsCameraVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
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
