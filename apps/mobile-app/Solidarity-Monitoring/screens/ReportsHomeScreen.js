import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const ReportsHomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Logo y Título */}
      <Image source={require('../assets/favicon.png')} style={styles.logo} />
      <Text style={styles.foundationText}>Gestión de Reportes</Text>

      {/* Botones de opciones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('ReportsListScreen')}
        >
          <Text style={styles.buttonText}>Ver Reportes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('ReportsScreen')}
        >
          <Text style={styles.buttonText}>Crear Reportes</Text>
        </TouchableOpacity>
      </View>

      {/* Indicador de progreso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarYellow} />
        <View style={styles.progressBarBlue} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  foundationText: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  optionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    width: '80%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
    overflow: 'hidden',
  },
  progressBarYellow: {
    flex: 0.6,
    backgroundColor: '#FFD700',
  },
  progressBarBlue: {
    flex: 0.4,
    backgroundColor: '#60A5FA',
  },
});

export default ReportsHomeScreen;
