import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ReportDetailScreen = ({ route }) => {
  const { report } = route.params;
  console.log("Contenido de los reportes: ", report)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{report.nombresApellidos}</Text>
      <Text style={styles.detail}>Número de Indetificación: {report.identificacion}</Text>
      <Text style={styles.detail}>Creado el: {report.createdAt}</Text>
      <Text style={styles.detail}>Creado por: {report.createdBy}</Text>
      <Text style={styles.detail}>Reporte: {report.reporte}</Text>
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
