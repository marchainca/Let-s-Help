import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import CryptoJS from 'crypto-js';
import { UserContext } from '../context/UserContext';
import { mapAuthContentToUser } from '../api/authSession';
import { changeAppLanguage } from '../i18n';
import { apiFetch } from '../api/apiClient';

const LANGUAGES = [
  { code: 'es', labelKey: 'language.spanish' },
  { code: 'en', labelKey: 'language.english' },
];

const LoginScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const { login } = useContext(UserContext);

  const currentLanguageLabel =
    i18n.language === 'en' ? t('language.english') : t('language.spanish');

  const handleLanguageSelect = async (languageCode) => {
    await changeAppLanguage(languageCode);
    setLanguageModalVisible(false);
  };

  const handleLogin = async () => {
    try {
      const hashPassword = CryptoJS.SHA256(password).toString();
      const apiUrl = process.env.EXPO_PUBLIC_API_URL + 'auth/login';
      const response = await apiFetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: hashPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await login(mapAuthContentToUser(data.content));
        navigation.navigate('Home');
      } else {
        Alert.alert(t('common.error'), t('login.invalidCredentials'));
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Alert.alert(t('common.error'), t('common.serverConnectionErrorShort'));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Image source={require('../assets/clave.png')} style={styles.logo} />
      <Text style={styles.foundationText}>{t('login.foundation')}</Text>

      <Text style={styles.title}>{t('login.title')}</Text>
      <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

      <Text style={styles.label}>{t('common.email')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('login.emailPlaceholder')}
        placeholderTextColor="#A0A0A0"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>{t('common.password')}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('login.passwordPlaceholder')}
          placeholderTextColor="#A0A0A0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.showPasswordButton}
        >
          <Text style={styles.showPasswordText}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setLanguageModalVisible(true)}
      >
        <Text style={styles.languageButtonLabel}>{t('language.label')}</Text>
        <Text style={styles.languageButtonValue}>{currentLanguageLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>{t('login.submit')}</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>{t('login.forgotPassword')}</Text>
      </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('language.modalTitle')}</Text>
            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  i18n.language === language.code && styles.languageOptionSelected,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    i18n.language === language.code && styles.languageOptionTextSelected,
                  ]}
                >
                  {t(language.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 32,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 30,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: '#000',
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 10,
  },
  showPasswordText: {
    fontSize: 18,
    color: '#A0A0A0',
  },
  languageButton: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  languageButtonLabel: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  languageButtonValue: {
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#1E90FF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  languageOption: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  languageOptionSelected: {
    borderColor: '#1E90FF',
    backgroundColor: '#E8F4FF',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#333',
  },
  languageOptionTextSelected: {
    color: '#1E90FF',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#A0A0A0',
    fontSize: 14,
  },
});

export default LoginScreen;
