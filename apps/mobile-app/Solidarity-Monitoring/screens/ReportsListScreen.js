import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';

const ReportsListScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}reports/recent`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.content || []);
      } else {
        const errorData = await response.json();
        Alert.alert(
          t('common.error'),
          t('reportsList.fetchFailed', { message: errorData.message })
        );
      }
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      Alert.alert(t('common.error'), t('common.serverConnectionError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) =>
    report.nombresApellidos.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={t('reportsList.searchPlaceholder')}
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.reportItem}
              onPress={() => navigation.navigate('ReportDetailScreen', { report: item })}
            >
              <Text style={styles.reportName}>{item.nombresApellidos}</Text>
              <Text style={styles.reportDetail}>{item.reporte}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  reportItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 8,
  },
  reportName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  reportDetail: {
    color: '#555',
  },
});

export default ReportsListScreen;
