import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';

const AttendanceFormWithDataScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const { recognizedData } = route.params;

  const [programs, setPrograms] = useState([]);
  const [subPrograms, setSubPrograms] = useState({});
  const [activities, setActivities] = useState([]);
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
        setPrograms(data.content.getPrograms || []);
      } else {
        Alert.alert(t('common.error'), t('attendanceFormWithData.programsLoadFailed'));
      }
    } catch (error) {
      console.error('Error al cargar programas:', error);
      Alert.alert(t('common.error'), t('attendanceFormWithData.programsLoadError'));
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
        setSubPrograms(data.content || {});
        setSelectedSubProgram('');
        setActivities([]);
        setSelectedActivity('');
      } else {
        Alert.alert(t('common.error'), t('attendanceFormWithData.subprogramsLoadFailed'));
      }
    } catch (error) {
      console.error('Error al cargar subprogramas:', error);
      Alert.alert(t('common.error'), t('attendanceFormWithData.subprogramsLoadError'));
    }
  };

  const handleProgramChange = (program) => {
    setSelectedProgram(program);
    if (program) {
      fetchSubPrograms(program);
    }
  };

  const handleSubProgramChange = (subProgram) => {
    setSelectedSubProgram(subProgram);
    if (subProgram) {
      const selectedActivities = subPrograms[subProgram] || [];
      setActivities(selectedActivities);
      setSelectedActivity('');
    }
  };

  const handleRegisterAttendance = async () => {
    if (!selectedProgram || !selectedSubProgram || !selectedActivity) {
      Alert.alert(t('common.error'), t('attendanceFormWithData.selectProgramSubprogramActivity'));
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
    };

    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}attendance/register`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(attendanceData),
      });

      if (response.ok) {
        Alert.alert(t('common.success'), t('attendanceFormWithData.attendanceRegistered'));
        navigation.goBack();
      } else {
        const errorData = await response.json();
        Alert.alert(
          t('common.error'),
          t('attendanceFormWithData.attendanceRegisterFailed', { message: errorData.message })
        );
      }
    } catch (error) {
      console.error('Error al registrar la asistencia:', error);
      Alert.alert(t('common.error'), t('common.serverConnectionError'));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('attendanceFormWithData.title')}</Text>

      <Picker selectedValue={selectedProgram} onValueChange={handleProgramChange}>
        <Picker.Item label={t('attendanceFormWithData.selectProgram')} value="" />
        {programs.map((program, index) => (
          <Picker.Item key={index} label={program} value={program} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedSubProgram}
        onValueChange={handleSubProgramChange}
        enabled={!!selectedProgram}
      >
        <Picker.Item label={t('attendanceFormWithData.selectSubprogram')} value="" />
        {Object.keys(subPrograms).map((subProgram, index) => (
          <Picker.Item key={index} label={subProgram} value={subProgram} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedActivity}
        onValueChange={(value) => setSelectedActivity(value)}
        enabled={!!selectedSubProgram}
      >
        <Picker.Item label={t('attendanceFormWithData.selectActivity')} value="" />
        {activities.map((activity, index) => (
          <Picker.Item key={index} label={activity} value={activity} />
        ))}
      </Picker>

      <Text style={styles.label}>{t('common.name')}</Text>
      <TextInput style={styles.input} value={recognizedData.firstName} editable={false} />

      <Text style={styles.label}>{t('common.lastName')}</Text>
      <TextInput style={styles.input} value={recognizedData.lastName} editable={false} />

      <Text style={styles.label}>{t('common.age')}</Text>
      <TextInput style={styles.input} value={recognizedData.age} editable={false} />

      <Text style={styles.label}>{t('common.documentType')}</Text>
      <TextInput style={styles.input} value={recognizedData.documentType} editable={false} />

      <Text style={styles.label}>{t('common.documentNumber')}</Text>
      <TextInput style={styles.input} value={recognizedData.documentNumber} editable={false} />

      <TouchableOpacity style={styles.button} onPress={handleRegisterAttendance}>
        <Text style={styles.buttonText}>{t('attendanceFormWithData.registerAttendance')}</Text>
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
