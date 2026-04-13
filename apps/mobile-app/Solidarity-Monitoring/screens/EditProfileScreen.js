import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import CryptoJS from 'crypto-js';
import { UserContext } from '../context/UserContext';

const EditProfileScreen = () => {
  // Función para convertir la fecha de "DD/MM/YYYY" a "YYYY-MM-DD"
  const parseDate = (dateString) => {
    if (!dateString) return new Date(); // Si no hay fecha, usar la fecha actual
  
    // Si el valor es un objeto Date válido, devuélvelo tal cual
    if (dateString instanceof Date && !isNaN(dateString)) {
      return dateString;
    }
  
    // Si es un string, intentar convertirlo a Date
    try {
      const date = new Date(dateString);
      if (!isNaN(date)) return date;
    } catch (error) {
      console.error('Error al convertir la fecha:', error);
    }
  
    // Como último recurso, devuelve la fecha actual
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
  //console.log("User->", user)
  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) setBirthdate(selectedDate);
  };

   // Cambiar imagen de perfil
   const handleChangeImage = async () => {
    try {
      // Pedir permisos para acceder a la galería
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permiso denegado', 'Es necesario otorgar permisos para cambiar la imagen.');
        return;
      }

      // Abrir la galería para seleccionar una imagen
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:  ['images'],
        allowsEditing: true,
        aspect: [1, 1], // Relación de aspecto 1:1 (cuadrada)
        quality: 0.8, // Calidad de la imagen (80%)
        base64: true,
      });

      if (!pickerResult.canceled) {
        // Actualizar el estado con la nueva imagen
        setProfileImage(`data:image/jpeg;base64,${pickerResult.assets[0].base64}`);
        Alert.alert('Éxito', 'Imagen de perfil actualizada.');
      }
    } catch (error) {
      console.error('Error al cambiar la imagen de perfil:', error);
      Alert.alert('Error', 'No se pudo cambiar la imagen de perfil.');
    }
  };

  const handleSaveChanges = async () => {
    // Verificar que las contraseñas coincidan
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    // Solo incluir campos que hayan cambiado
    const updatedData = {};
    if (profileImage !== user?.profileImageUrl) updatedData.urlImage = profileImage;
    if (name !== user?.name) updatedData.name = name;
    if (email !== user?.email) updatedData.email = email;
    if (idNumber !== user?.idNumber) updatedData.idNumber = idNumber;
    if (birthdate.toISOString().split('T')[0] !== user?.birthdate) {
      updatedData.birthdate = birthdate.toISOString().split('T')[0];
    }
    if (password) updatedData.password = CryptoJS.SHA256(password).toString();

    // Verificar si hay cambios
    if (Object.keys(updatedData).length === 0) {
      Alert.alert('Sin cambios', 'No hay cambios para guardar.');
      return;
    }

    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}users/:id=${user.id}`;
      console.log("Data enviada actualizar perfil: ", updatedData)
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        console.log(response);
        Alert.alert('Éxito', 'Perfil actualizado correctamente.');
        updateUser(updatedData); // Actualizar el contexto con los nuevos datos
      } else {
        const errorData = await response.json();
        Alert.alert('Error', `No se pudo actualizar el perfil: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      {/* Cambiar Imagen */}
      <TouchableOpacity onPress={handleChangeImage}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <Text style={styles.changeImageText}>Cambiar Imagen</Text>
      </TouchableOpacity>

      {/* Editar Nombre */}
      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      {/* Editar Correo */}
      <Text style={styles.label}>Correo Electrónico</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

      {/* Editar Número de Identificación */}
      <Text style={styles.label}>Número de Identificación</Text>
      <TextInput style={styles.input} value={idNumber} onChangeText={setIdNumber} keyboardType="numeric" />

      {/* Cambiar Fecha de Nacimiento */}
      <Text style={styles.label}>Fecha de Nacimiento</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => DateTimePickerAndroid.open({ value: birthdate, onChange: handleDateChange })}
      >
        <Text>
          {birthdate instanceof Date
            ? birthdate.toISOString().split('T')[0] // Mostrar fecha en formato YYYY-MM-DD
            : ''}
        </Text>
      </TouchableOpacity>

      {/* Cambiar Contraseña */}
      <Text style={styles.label}>Nueva Contraseña</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

      {/* Confirmar Contraseña */}
      <Text style={styles.label}>Confirmar Contraseña</Text>
      <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

      {/* Botón para guardar cambios */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Guardar Cambios</Text>
      </TouchableOpacity>
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
});

export default EditProfileScreen;
