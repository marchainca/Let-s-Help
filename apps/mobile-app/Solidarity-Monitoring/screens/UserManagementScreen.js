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
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { apiFetch } from '../api/apiClient';

const UserManagementScreen = () => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setBirthday(formattedDate);
    }
  };

  const registerUser = async () => {
    if (!email || !name || !idNumber || !password || !birthday || !gender) {
      Alert.alert(t('common.error'), t('common.allFieldsRequired'));
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
          urlImage: 'https://storage.googleapis.com/bucket-let-s-help/defaultPerfil.png',
          password: CryptoJS.SHA256(password).toString(),
          gender,
          role: 'Collaborator',
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
        setEmail('');
        setName('');
        setIdNumber('');
        setPassword('');
        setBirthday('');
        setGender('');
      } else {
        const errorData = await response.json();
        Alert.alert(
          t('common.error'),
          errorData.message || t('userManagement.registerFailed')
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
    <View style={styles.container}>
      <Text style={styles.title}>{t('userManagement.title')}</Text>

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
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text>{item.email}</Text>
            <TouchableOpacity onPress={() => removeUser(item.id)}>
              <Text style={styles.removeButton}>{t('common.delete')}</Text>
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
