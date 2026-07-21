import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { apiFetch } from '../api/apiClient';

const AttendanceFormScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [programs, setPrograms] = useState([]);
  const [program, setProgram] = useState('');
  const [subprograms, setSubprograms] = useState([]);
  const [subprogram, setSubprogram] = useState('');
  const [activities, setActivities] = useState({});
  const [activity, setActivity] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentNumber: '',
    reason: '',
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [justificationType, setJustificationType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const fetchPrograms = async () => {
    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}activities/programs`;
      const response = await apiFetch(apiUrl, {
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
      const response = await apiFetch(apiUrl, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        const subprogramsData = Object.keys(data.content || {});
        setSubprograms(subprogramsData);
        setActivities(data.content || {});
        setActivity('');
        setSubprogram('');
      } else {
        console.error('Error fetching subprograms and activities:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching subprograms and activities:', error);
    }
  };

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      setLoadingSuggestions(true);
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}recognition/search?name=${query}`;
      const response = await apiFetch(apiUrl, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.content || []);
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
    fetchSubprogramsAndActivities(selectedProgram);
  };

  const handleSubprogramChange = (selectedSubprogram) => {
    setSubprogram(selectedSubprogram);
    setActivity('');
  };

  const handleSuggestionSelect = (item) => {
    setFormData({
      firstName: item.name.trim(),
      lastName: item.lastName.trim(),
      documentNumber: item.documentNumber.toString(),
      reason: formData.reason,
    });
    setSuggestions([]);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

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

  const handleJustificationChange = (value) => {
    setJustificationType(value);

    if (value === 'unjustified') {
      setFormData((prev) => ({
        ...prev,
        reason: t('attendanceForm.unjustifiedDefaultReason'),
      }));
      return;
    }

    if (value === 'justified') {
      setFormData((prev) => ({
        ...prev,
        reason: prev.reason === t('attendanceForm.unjustifiedDefaultReason') ? '' : prev.reason,
      }));
    }
  };

  const handleSubmit = async () => {
    if (
      !program ||
      !subprogram ||
      !activity ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.documentNumber ||
      !justificationType ||
      !formData.reason
    ) {
      Alert.alert(t('common.error'), t('common.completeAllFieldsFormal'));
      return;
    }

    const requestData = {
      identificacion: formData.documentNumber,
      idUsuario: user.id,
      programa: program,
      subprograma: subprogram,
      actividad: activity,
      motivo: formData.reason,
      fecha: selectedDate.toISOString().split('T')[0],
      justificada: justificationType === 'justified',
    };

    try {
      setIsSubmitting(true);
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}attendance/absences`;
      const response = await apiFetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        Alert.alert(t('common.success'), t('attendanceForm.absenceRegistered'));
        navigation.goBack();
      } else {
        const errorData = await response.json();
        Alert.alert(
          t('common.error'),
          t('attendanceForm.absenceRegisterFailed', { message: errorData.message })
        );
      }
    } catch (error) {
      console.error('Error al registrar la inasistencia:', error);
      Alert.alert(t('common.error'), t('common.serverConnectionError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>{t('attendanceForm.header')}</Text>

      <Picker
        selectedValue={program}
        style={styles.picker}
        onValueChange={(itemValue) => handleProgramChange(itemValue)}
      >
        <Picker.Item label={t('attendanceForm.selectProgram')} value="" />
        {programs.map((programName, index) => (
          <Picker.Item key={index} label={programName} value={programName} />
        ))}
      </Picker>

      <Picker
        selectedValue={subprogram}
        style={styles.picker}
        onValueChange={(itemValue) => handleSubprogramChange(itemValue)}
        enabled={!!program}
      >
        <Picker.Item label={t('attendanceForm.selectSubprogram')} value="" />
        {subprograms.map((subprogramName, index) => (
          <Picker.Item key={index} label={subprogramName} value={subprogramName} />
        ))}
      </Picker>

      <Picker
        selectedValue={activity}
        style={styles.picker}
        onValueChange={(itemValue) => setActivity(itemValue)}
        enabled={!!subprogram}
      >
        <Picker.Item label={t('attendanceForm.selectActivity')} value="" />
        {(activities[subprogram] || []).map((activityName, index) => (
          <Picker.Item key={index} label={activityName} value={activityName} />
        ))}
      </Picker>

      <Text style={styles.label}>{t('attendanceForm.firstNameLabel')}</Text>
      <TextInput
        style={styles.input}
        value={formData.firstName}
        onChangeText={(text) => handleInputChange('firstName', text)}
        placeholder={t('attendanceForm.namePlaceholder')}
      />
      {loadingSuggestions && (
        <Text style={styles.loadingText}>{t('common.searching')}</Text>
      )}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsList}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionSelect(item)}
            >
              <Text>
                {item.name.trim()} {item.lastName.trim()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.label}>{t('attendanceForm.lastNameLabel')}</Text>
      <TextInput style={styles.input} value={formData.lastName} editable={false} />

      <Text style={styles.label}>{t('attendanceForm.documentLabel')}</Text>
      <TextInput style={styles.input} value={formData.documentNumber} editable={false} />

      <Text style={styles.label}>{t('attendanceForm.dateLabel')}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text>{selectedDate.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>{t('attendanceForm.justificationLabel')}</Text>
      <Picker
        selectedValue={justificationType}
        style={styles.picker}
        onValueChange={handleJustificationChange}
      >
        <Picker.Item label={t('attendanceForm.selectJustification')} value="" />
        <Picker.Item label={t('attendanceForm.justified')} value="justified" />
        <Picker.Item label={t('attendanceForm.unjustified')} value="unjustified" />
      </Picker>

      <Text style={styles.label}>{t('attendanceForm.reasonLabel')}</Text>
      <TextInput
        style={styles.input}
        value={formData.reason}
        onChangeText={(text) => handleInputChange('reason', text)}
        multiline
        textAlignVertical="top"
        editable={justificationType !== 'unjustified'}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
        <Text style={styles.submitButtonText}>
          {isSubmitting ? t('common.registering') : t('attendanceForm.registerAbsence')}
        </Text>
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
    marginVertical: 5,
    marginBottom: 15,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  loadingText: {
    marginBottom: 10,
    color: '#888',
    fontStyle: 'italic',
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
