import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.title')}</Text>

      <View style={styles.shortcutsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Attendance')}
        >
          <Text style={styles.buttonText}>{t('home.registerAttendance')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ReportsHome')}
        >
          <Text style={styles.buttonText}>{t('home.createReport')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Indicators')}
        >
          <Text style={styles.buttonText}>{t('home.viewIndicators')}</Text>
        </TouchableOpacity>
      </View>
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
    textAlign: 'center',
  },
  shortcutsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
