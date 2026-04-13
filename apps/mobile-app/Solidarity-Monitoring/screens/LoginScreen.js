import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
//import 'dotenv/config';
import CryptoJS from 'crypto-js';
import { UserContext } from '../context/UserContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(UserContext);

  const handleLogin = async () => {
    try {
      //encriptacion 
      const hashPassword = CryptoJS.SHA256(password).toString();
      console.log("hashPassword", hashPassword);
      const apiUrl = process.env.EXPO_PUBLIC_API_URL + 'auth/login' ;
      console.log("Url de autenticación: ", apiUrl)
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: hashPassword, // Enviamos la contraseña encriptada
        }),
      });
      
      
      if (response.ok) {
        const data = await response.json();
        console.log("Respuesta login", data )
        // Suponemos que `data` tiene la estructura:
        // { name, email, profileImageUrl, role }
        login({
          id: data.content.user.id,
          idNumber:data.content.user.idNumber,
          name: data.content.user.name,
          email: data.content.user.email,
          role: data.content.user.role,
          profileImageUrl: data.content.user.urlImage,
          accessToken: data.content.accessToken,
          birthdate:data.content.user.birthdate
        });

        // Navegar a la pantalla principal
        navigation.navigate("Home");
      } else {
        // Manejo de error en caso de credenciales inválidas
        console.log("else error", response)
        Alert.alert("Error", "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo y Título */}
      <Image source={require('../assets/clave.png')} style={styles.logo} />
      <Text style={styles.foundationText}>Creando Futuro</Text>

      {/* Título de Acceso */}
      <Text style={styles.title}>Acceso</Text>
      <Text style={styles.subtitle}>¡Hola! Qué bueno verte de nuevo.</Text>

      {/* Campo de Correo Electrónico */}
      <Text style={styles.label}>Correo Electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="ejemplo@email.com"
        placeholderTextColor="#A0A0A0"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Campo de Contraseña */}
      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#A0A0A0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
          <Text style={styles.showPasswordText}>{showPassword ? "🙈" : "👁️"}</Text>
        </TouchableOpacity>
      </View>

      {/* Botón de Ingreso */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Ingresa</Text>
      </TouchableOpacity>

      {/* Enlace de ¿Olvidaste tu contraseña? */}
      <TouchableOpacity>
        <Text style={styles.forgotPassword}>¿Has olvidado tu contraseña?</Text>
      </TouchableOpacity>
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
});

export default LoginScreen;
