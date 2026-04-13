import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { UserContext } from '../context/UserContext';

const AttendanceFormWithDataScreen = ({ route, navigation }) => {
  const { user } = useContext(UserContext);
  const { recognizedData } = route.params;

  const [programs, setPrograms] = useState([]); // Lista de programas
  const [subPrograms, setSubPrograms] = useState({}); // Subprogramas y actividades (mapa)
  const [activities, setActivities] = useState([]); // Lista de actividades del subprograma seleccionado

  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSubProgram, setSelectedSubProgram] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}activities/programs`;
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.content.getPrograms || []); // Cargar programas desde la respuesta
      } else {
        Alert.alert('Error', 'No se pudieron cargar los programas.');
      }
    } catch (error) {
      console.error('Error al cargar programas:', error);
      Alert.alert('Error', 'Hubo un problema al cargar los programas.');
    }
  };

  const fetchSubPrograms = async (program) => {
    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}activities/${encodeURIComponent(program)}`;
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubPrograms(data.content || {}); // Almacenar subprogramas como un mapa
        setSelectedSubProgram('');
        setActivities([]); // Reiniciar actividades
        setSelectedActivity('');
      } else {
        Alert.alert('Error', 'No se pudieron cargar los subprogramas.');
      }
    } catch (error) {
      console.error('Error al cargar subprogramas:', error);
      Alert.alert('Error', 'Hubo un problema al cargar los subprogramas.');
    }
  };

  const handleProgramChange = (program) => {
    setSelectedProgram(program);
    if (program) {
      fetchSubPrograms(program); // Cargar subprogramas para el programa seleccionado
    }
  };

  const handleSubProgramChange = (subProgram) => {
    setSelectedSubProgram(subProgram);
    if (subProgram) {
      const selectedActivities = subPrograms[subProgram] || [];
      setActivities(selectedActivities); // Cargar actividades para el subprograma seleccionado
      setSelectedActivity('');
    }
  };

  const handleRegisterAttendance = async () => {
    if (!selectedProgram || !selectedSubProgram || !selectedActivity) {
      Alert.alert('Error', 'Por favor seleccione un programa, subprograma y actividad.');
      return;
    }
  
    const attendanceData = {
      program: selectedProgram,
      subProgram: selectedSubProgram,
      activity: selectedActivity,
      firstName: recognizedData.firstName,
      lastName: recognizedData.lastName,
      documentType: recognizedData.documentType,
      documentNumber: recognizedData.documentNumber,
      /* age: recognizedData.age, */
    };
  
    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}attendance/register`; // Asegúrate de que este endpoint sea correcto
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(attendanceData),
      });
  
      if (response.ok) {
        Alert.alert('Éxito', 'Asistencia registrada con éxito.');
        navigation.goBack();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', `No se pudo registrar la asistencia: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error al registrar la asistencia:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Formulario de Asistencia</Text>

      {/* Selector de programa */}
      <Picker selectedValue={selectedProgram} onValueChange={handleProgramChange}>
        <Picker.Item label="Seleccione un programa" value="" />
        {programs.map((program, index) => (
          <Picker.Item key={index} label={program} value={program} />
        ))}
      </Picker>

      {/* Selector de subprograma */}
      <Picker
        selectedValue={selectedSubProgram}
        onValueChange={handleSubProgramChange}
        enabled={!!selectedProgram}
      >
        <Picker.Item label="Seleccione un subprograma" value="" />
        {Object.keys(subPrograms).map((subProgram, index) => (
          <Picker.Item key={index} label={subProgram} value={subProgram} />
        ))}
      </Picker>

      {/* Selector de actividad */}
      <Picker
        selectedValue={selectedActivity}
        onValueChange={(value) => setSelectedActivity(value)}
        enabled={!!selectedSubProgram}
      >
        <Picker.Item label="Seleccione una actividad" value="" />
        {activities.map((activity, index) => (
          <Picker.Item key={index} label={activity} value={activity} />
        ))}
      </Picker>

      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={recognizedData.firstName} editable={false} />

      <Text style={styles.label}>Apellido</Text>
      <TextInput style={styles.input} value={recognizedData.lastName} editable={false} />

      <Text style={styles.label}>Edad</Text>
      <TextInput style={styles.input} value={recognizedData.age} editable={false} />

      <Text style={styles.label}>Tipo de Documento</Text>
      <TextInput style={styles.input} value={recognizedData.documentType} editable={false} />

      <Text style={styles.label}>Número de Documento</Text>
      <TextInput style={styles.input} value={recognizedData.documentNumber} editable={false} />

      <TouchableOpacity style={styles.button} onPress={handleRegisterAttendance}>
        <Text style={styles.buttonText}>Registrar Asistencia</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AttendanceFormWithDataScreen;
