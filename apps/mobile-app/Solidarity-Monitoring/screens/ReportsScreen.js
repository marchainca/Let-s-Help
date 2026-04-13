import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { UserContext } from '../context/UserContext';

const ReportsScreen = () => {
  const { user } = useContext(UserContext);

  // Estados para el formulario
  const [nameQuery, setNameQuery] = useState(''); 
  const [id, setId] = useState(''); 
  const [name, setName] = useState(''); 
  const [lastName, setLastName] = useState(''); 
  const [profileImage, setProfileImage] = useState(''); 
  const [report, setReport] = useState(''); 

  // Estados para manejar la búsqueda
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Estados para el envío del reporte
  const [submittingReport, setSubmittingReport] = useState(false);

  // Consultar al backend para autocompletar nombres
  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]); 
      return;
    }

    try {
      setLoadingSuggestions(true);
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}recognition/search?name=${query}`;
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.content || []); 
      } else {
        const errorData = await response.json();
        console.error('Error al buscar sugerencias:', errorData.message);
      }
    } catch (error) {
      console.error('Error al buscar sugerencias:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Rellenar campos al seleccionar una sugerencia
  const handleSuggestionSelect = (item) => {
    setName(item.name.trim());
    setLastName(item.lastName.trim());
    setId(item.documentNumber);
    setProfileImage(`data:image/jpeg;base64,${item.profileImage || ''}`); 
    setSuggestions([]); 
    setNameQuery(item.name.trim());
  };

  // Manejar el envío del reporte
  const handleReportSubmit = async () => {
    if (!report) {
      Alert.alert('Error', 'Por favor escribe el reporte antes de enviarlo.');
      return;
    }

    const requestData = {
      identificacion: id,
      nombresApellidos: name + " " + lastName,
      reporte: report,
      createdBy: user.name,
    };

    try {
      setSubmittingReport(true);
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}reports/create`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Reporte enviado correctamente.');
        Toast.show({
          type: 'success',
          text1: `${name} ${lastName}`,
          text2: 'Ha realizado un reporte.',
          visibilityTime: 8000,
        });

        // Limpiar todos los campos del formulario
        setNameQuery('');
        setId('');
        setName('');
        setLastName('');
        setProfileImage('');
        setReport('');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', `No se pudo enviar el reporte: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error al enviar el reporte:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.title}>Reporte</Text>

      {/* Imagen de perfil */}
      {profileImage ? (
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>Foto</Text>
        </View>
      )}

      {/* Campo Nombres */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombres</Text>
        <TextInput
          style={styles.input}
          placeholder="Introduce el nombre"
          value={nameQuery}
          onChangeText={(text) => {
            setNameQuery(text);
            fetchSuggestions(text); 
          }}
        />
        {loadingSuggestions && <Text style={styles.loadingText}>Buscando...</Text>}
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(item)}
              >
                <Text style={styles.suggestionText}>
                  {item.name.trim()} {item.lastName.trim()}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled" 
          />
        )}
      </View>

      {/* Campo Identificación */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Identificación</Text>
        <TextInput
          style={styles.input}
          value={id}
          editable={false} 
        />
      </View>

      {/* Campo Nombres y Apellidos */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombres y Apellidos</Text>
        <TextInput
          style={styles.input}
          value={`${name} ${lastName}`}
          editable={false} 
        />
      </View>

      {/* Campo Reporte */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Reporte</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline={true}
          placeholder="Escribe el reporte aquí..."
          value={report}
          onChangeText={setReport}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Reporte creado por</Text>
        <TextInput
          style={styles.input}
          value={`${user?.name}`}
          editable={false}
        />
      </View>

      {/* Botón para enviar reporte */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleReportSubmit}
        disabled={submittingReport}
      >
        <Text style={styles.buttonText}>
          {submittingReport ? 'Enviando...' : 'Enviar reporte'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 18,
    color: '#888',
  },
  formGroup: {
    marginBottom: 15,
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
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  suggestionsList: {
    maxHeight: 150,
    marginVertical: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  suggestionText: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingText: {
    fontStyle: 'italic',
    marginTop: 5,
  },
});

export default ReportsScreen;
