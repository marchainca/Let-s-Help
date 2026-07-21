import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

const AttendanceScreen = ({ navigation }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Image source={require('../assets/favicon.png')} style={styles.logo} />
      <Text style={styles.foundationText}>{t('attendance.foundation')}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('AttendanceForm')}
        >
          <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {t('attendance.absences')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('FaceRecognition')}
        >
          <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {t('attendance.attendance')}
          </Text>
        </TouchableOpacity>
      </View>

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
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    minHeight: 56,
    paddingVertical: 15,
    paddingHorizontal: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
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

export default AttendanceScreen;
