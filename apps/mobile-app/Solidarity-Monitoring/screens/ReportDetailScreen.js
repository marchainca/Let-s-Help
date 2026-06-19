import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const ReportDetailScreen = ({ route }) => {
  const { report } = route.params;
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{report.nombresApellidos}</Text>
      <Text style={styles.detail}>
        {t('reportDetail.identification')} {report.identificacion}
      </Text>
      <Text style={styles.detail}>
        {t('reportDetail.createdAt')} {report.createdAt}
      </Text>
      <Text style={styles.detail}>
        {t('reportDetail.createdBy')} {report.createdBy}
      </Text>
      <Text style={styles.detail}>
        {t('reportDetail.report')} {report.reporte}
      </Text>
    </View>
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
  detail: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default ReportDetailScreen;
