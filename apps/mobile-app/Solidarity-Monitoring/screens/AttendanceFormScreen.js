import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserContext } from '../context/UserContext';

const AttendanceFormScreen = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Registro de Inasistencias',
    });
  }, []);

  const { user } = useContext(UserContext);
  const [programs, setPrograms] = useState([]); // List of programs
  const [program, setProgram] = useState(''); // Selected program

  const [subprograms, setSubprograms] = useState([]); // List of subprograms
  const [subprogram, setSubprogram] = useState(''); // Selected subprogram

  const [activities, setActivities] = useState({}); // Activities mapped to subprograms
  const [activity, setActivity] = useState(''); // Selected activity

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentNumber: '',
    reason: '',
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [suggestions, setSuggestions] = useState([]); // Suggestions for names
  const [loadingSuggestions, setLoadingSuggestions] = useState(false); // Loading state for suggestions

  
  const fetchPrograms = async () => {
    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}activities/programs`;
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPrograms(data.content.getPrograms || []); 
      } else {
        console.error('Error fetching programs:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  
  const fetchSubprogramsAndActivities = async (programName) => {
    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}activities/${encodeURIComponent(programName)}`;
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        const subprogramsData = Object.keys(data.content || {}); // Extract subprogram names
        setSubprograms(subprogramsData); 
        setActivities(data.content || {}); 
        setActivity(''); // Reset activity selection
        setSubprogram(''); // Reset subprogram selection
      } else {
        console.error('Error fetching subprograms and activities:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching subprograms and activities:', error);
    }
  };

  // Fetch suggestions for names from the backend
  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]); // Clear suggestions if query is empty
      return;
    }

    try {
      setLoadingSuggestions(true);
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}recognition/search?name=${query}`;
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.content || []); // Store suggestions
      } else {
        console.error('Error fetching suggestions:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleProgramChange = (selectedProgram) => {
    setProgram(selectedProgram);
    fetchSubprogramsAndActivities(selectedProgram); // Fetch subprograms and activities for the selected program
  };

  const handleSubprogramChange = (selectedSubprogram) => {
    setSubprogram(selectedSubprogram);
    setActivity(''); // Reset activity selection when subprogram changes
  };

  const handleSuggestionSelect = (item) => {
    setFormData({
      firstName: item.name.trim(),
      lastName: item.lastName.trim(),
      documentNumber: item.documentNumber.toString(),
      reason: formData.reason, // Keep existing reason
    });
    setSuggestions([]); // Clear suggestions
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // If the "Nombres" field is being edited, trigger name search
    if (field === 'firstName') {
      fetchSuggestions(value);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSubmit = async () => {
    if (!program || !subprogram || !activity || !formData.firstName || !formData.lastName || !formData.documentNumber || !formData.reason) {
      Alert.alert('Error', 'Por favor complete todos los campos.');
      return;
    }

    const requestData = {
      identificacion: formData.documentNumber,
      programa: program,
      subprograma: subprogram,
      actividad: activity,
      motivo: formData.reason,
      fecha: selectedDate.toISOString().split('T')[0],
    };

    try {
      setIsSubmitting(true);
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}attendance/absences`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Inasistencia registrada correctamente.');
        navigation.goBack();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', `No se pudo registrar la inasistencia: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error al registrar la inasistencia:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPrograms(); // Load programs on mount
  }, []);

  return (
    <FlatList
      data={[{ key: 'form' }]}
      renderItem={() => (
        <View style={styles.container}>
          <Text style={styles.header}>Formulario de Inasistencias</Text>

          {/* Program Selector */}
          <Picker
            selectedValue={program}
            style={styles.picker}
            onValueChange={(itemValue) => handleProgramChange(itemValue)}
          >
            <Picker.Item label="Seleccione un programa" value="" />
            {programs.map((programName, index) => (
              <Picker.Item key={index} label={programName} value={programName} />
            ))}
          </Picker>

          {/* Subprogram Selector */}
          <Picker
            selectedValue={subprogram}
            style={styles.picker}
            onValueChange={(itemValue) => handleSubprogramChange(itemValue)}
            enabled={!!program}
          >
            <Picker.Item label="Seleccione un subprograma" value="" />
            {subprograms.map((subprogramName, index) => (
              <Picker.Item key={index} label={subprogramName} value={subprogramName} />
            ))}
          </Picker>

          {/* Activity Selector */}
          <Picker
            selectedValue={activity}
            style={styles.picker}
            onValueChange={(itemValue) => setActivity(itemValue)}
            enabled={!!subprogram}
          >
            <Picker.Item label="Seleccione una actividad" value="" />
            {(activities[subprogram] || []).map((activityName, index) => (
              <Picker.Item key={index} label={activityName} value={activityName} />
            ))}
          </Picker>

          {/* Form Fields */}
          <Text style={styles.label}>Nombres:</Text>
          <TextInput
            style={styles.input}
            value={formData.firstName}
            onChangeText={(text) => handleInputChange('firstName', text)}
            placeholder="Introduce el nombre"
          />
          {loadingSuggestions && <Text style={styles.loadingText}>Buscando...</Text>}
          {suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSuggestionSelect(item)}>
                  <Text>{item.name.trim()} {item.lastName.trim()}</Text>
                </TouchableOpacity>
              )}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
            />
          )}

          <Text style={styles.label}>Apellidos:</Text>
          <TextInput style={styles.input} value={formData.lastName} editable={false} />

          <Text style={styles.label}>N° Documento:</Text>
          <TextInput style={styles.input} value={formData.documentNumber} editable={false} />

          <Text style={styles.label}>Fecha:</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text>{selectedDate.toISOString().split('T')[0]}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={selectedDate} mode="date" display="default" onChange={handleDateChange} />
          )}

          <Text style={styles.label}>Motivo de la inasistencia:</Text>
          <TextInput
            style={styles.input}
            value={formData.reason}
            onChangeText={(text) => handleInputChange('reason', text)}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
            <Text style={styles.submitButtonText}>{isSubmitting ? 'Registrando...' : 'Registrar Inasistencia'}</Text>
          </TouchableOpacity>
        </View>
      )}
      keyExtractor={(item) => item.key}
      keyboardShouldPersistTaps="handled"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
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
  submitButton: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AttendanceFormScreen;
