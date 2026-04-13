import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CryptoJS from 'crypto-js';
import { Picker } from '@react-native-picker/picker';
import { UserContext } from '../context/UserContext'; // Para obtener el token desde el contexto

const UserManagementScreen = ({ navigation }) => {
  const { user } = useContext(UserContext); // Obtener el usuario logueado y su token
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Registrar nuevo usuario',
    });
  }, []);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setBirthday(formattedDate);
    }
  };

  const registerUser = async () => {
    if (!email || !name || !idNumber || !password || !birthday || !gender) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    try {
      console.log("Data User: ", user )
      const apiUrl = process.env.EXPO_PUBLIC_API_URL + "users";
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`, // Usar el token del contexto
        },
        body: JSON.stringify({
          name,
          email,
          idNumber,
          birthdate: birthday,
          urlImage: 'https://storage.googleapis.com/bucket-let-s-help/defaultPerfil.png', // URL por defecto si está vacío
          password: CryptoJS.SHA256(password).toString(),
          gender: gender,
          role: "Collaborator"
        }),
      });
      const dataResponse = await response.json();
      console.log("Respuesta creacion usuario:");
      console.log(dataResponse);
      if (response.ok) {
        Alert.alert('Éxito', 'Usuario registrado correctamente');
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
        setEmail('');
        setName('');
        setIdNumber('');
        setPassword('');
        setBirthday('');
        setGender('');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Ocurrió un error al registrar el usuario');
      }
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    }
  };

  const removeUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Usuarios</Text>

      <TextInput
        style={styles.input}
        placeholder="Número de Identificación"
        value={idNumber}
        onChangeText={setIdNumber}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Nombres Completos"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Picker
        selectedValue={gender}
        style={styles.picker}
        onValueChange={(itemValue) => setGender(itemValue)}
      >
        <Picker.Item label="Seleccione el genero" value="" />
        <Picker.Item label="Masculino" value="M" />
        <Picker.Item label="Femenino" value="F" />
        <Picker.Item label="Otro" value="O" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>
          {birthday ? birthday : 'Seleccionar Fecha de Nacimiento'}
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
        <Text style={styles.buttonText}>Registrar Usuario</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text>{item.email}</Text>
            <TouchableOpacity onPress={() => removeUser(item.id)}>
              <Text style={styles.removeButton}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 20,
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
});

export default UserManagementScreen;
