import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, Alert,TouchableOpacity } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { UserContext } from '../context/UserContext';
import HomeScreen from '../screens/HomeScreen';
import IndicatorsScreen from '../screens/IndicatorsScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ReportsHomeScreen from '../screens/ReportsHomeScreen' 

const Drawer = createDrawerNavigator();

// Componente de contenido personalizado para el Drawer
function CustomDrawerContent(props) {
  const { user, logout } = useContext(UserContext);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: () => {
            logout();
            props.navigation.replace('Login'); // Redirigir al Login después de cerrar sesión
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.profileContainer}>
        <Image source={{ uri: user?.profileImageUrl }} style={styles.profileImage} />
        <Text style={styles.profileName}>{user?.name}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => props.navigation.navigate('Editar Perfil')}
        >
          <Text style={styles.editProfileText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Cerrar Sesión"
        onPress={handleLogout}
        style={styles.logoutItem}
        labelStyle={styles.logoutLabel}
      />
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: '#FF6F61', // Color de la opción activa
        drawerInactiveTintColor: '#333', // Color de la opción inactiva
        drawerLabelStyle: {
          fontSize: 16,
        },
      }}
    >
      <Drawer.Screen name="Inicio" component={HomeScreen} />
      <Drawer.Screen name="Indicadores" component={IndicatorsScreen} />
      <Drawer.Screen name="Asistencias" component={AttendanceScreen} />
      {/* <Drawer.Screen name="Reportes" component={ReportsScreen} /> */}
      <Drawer.Screen name="Reportes" component={ReportsHomeScreen} />
      <Drawer.Screen name="Admin" component={SettingsScreen} />
      <Drawer.Screen name="Editar Perfil" component={EditProfileScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
  },
  editProfileButton: {
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#4caf50',
    borderRadius: 5,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutItem: {
    marginTop: 20,
    /* borderTopWidth: 1, */
    borderTopColor: '#ccc',
  },
  logoutLabel: {
    color: '#4caf50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
