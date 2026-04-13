import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CameraPermissionProvider } from './context/CameraPermissionContext';
import { StyleSheet } from 'react-native';
import DrawerNavigator from './navigation/DrawerNavigator';
import LoginScreen from './screens/LoginScreen';
import { UserProvider } from './context/UserContext';
import AttendanceScreen from './screens/AttendanceScreen';
import FaceRecognitionScreen from './screens/FaceRecognitionScreen';
import AttendanceFormScreen from './screens/AttendanceFormScreen';
import AttendanceFormWithDataScreen from './screens/AttendanceFormWithDataScreen'
import Toast from 'react-native-toast-message';
import UserManagementScreen from './screens/UserManagementScreen';
import NewMemberScreen from './screens/NewMemberScreen'
import ReportsScreen from './screens/ReportsScreen'
import ReportsHomeScreen from './screens/ReportsHomeScreen'
import ReportsListScreen from './screens/ReportsListScreen'
import ReportDetailScreen from './screens/ReportDetailScreen'
import IndicatorsScreen from './screens/IndicatorsScreen'



const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <CameraPermissionProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">          
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />          
            <Stack.Screen name="Home" component={DrawerNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Indicators" component={IndicatorsScreen} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="FaceRecognition" component={FaceRecognitionScreen} />
            <Stack.Screen name="AttendanceForm" component={AttendanceFormScreen} />
            <Stack.Screen name="AttendanceFormWithData" component={AttendanceFormWithDataScreen} />
            <Stack.Screen name="UserManagementScreen" component={UserManagementScreen} />
            <Stack.Screen name="NewMemberScreen" component={NewMemberScreen} />
            <Stack.Screen name="ReportsHome" component={ReportsHomeScreen} options={{ title: 'Reportes' }} />
            <Stack.Screen name="ReportsListScreen" component={ReportsListScreen} options={{ title: 'Lista de Reportes' }} />
            <Stack.Screen name="ReportDetailScreen" component={ReportDetailScreen} options={{ title: 'Detalle del Reporte' }} />
            <Stack.Screen name="ReportsScreen" component={ReportsScreen} options={{ title: 'Crear Reporte' }} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </CameraPermissionProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
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
    alignItems: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#ff0000',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
