import React, { useContext, useEffect, useRef } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import DrawerNavigator from './DrawerNavigator';
import LoginScreen from '../screens/LoginScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import FaceRecognitionScreen from '../screens/FaceRecognitionScreen';
import AttendanceFormScreen from '../screens/AttendanceFormScreen';
import AttendanceFormWithDataScreen from '../screens/AttendanceFormWithDataScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import NewMemberScreen from '../screens/NewMemberScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ReportsHomeScreen from '../screens/ReportsHomeScreen';
import ReportsListScreen from '../screens/ReportsListScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import IndicatorsScreen from '../screens/IndicatorsScreen';

const Stack = createStackNavigator();
export const navigationRef = createNavigationContainerRef();

export default function RootNavigator() {
  const { t } = useTranslation();
  const { user, isAuthLoading } = useContext(UserContext);
  const wasAuthenticatedRef = useRef(false);

  useEffect(() => {
    if (isAuthLoading) return;

    if (user) {
      wasAuthenticatedRef.current = true;
      return;
    }

    if (wasAuthenticatedRef.current && navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }

    wasAuthenticatedRef.current = false;
  }, [user, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={user ? 'Home' : 'Login'}
        screenOptions={{ headerBackTitle: t('navigation.back') }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={DrawerNavigator} options={{ headerShown: false }} />
        <Stack.Screen
          name="Indicators"
          component={IndicatorsScreen}
          options={{ title: t('navigation.indicators') }}
        />
        <Stack.Screen
          name="Attendance"
          component={AttendanceScreen}
          options={{ title: t('navigation.attendance') }}
        />
        <Stack.Screen
          name="FaceRecognition"
          component={FaceRecognitionScreen}
          options={{ title: t('navigation.faceRecognition') }}
        />
        <Stack.Screen
          name="AttendanceForm"
          component={AttendanceFormScreen}
          options={{ title: t('navigation.absenceRegistration') }}
        />
        <Stack.Screen
          name="AttendanceFormWithData"
          component={AttendanceFormWithDataScreen}
          options={{ title: t('navigation.attendanceForm') }}
        />
        <Stack.Screen
          name="UserManagementScreen"
          component={UserManagementScreen}
          options={{ title: t('navigation.registerUser') }}
        />
        <Stack.Screen
          name="NewMemberScreen"
          component={NewMemberScreen}
          options={{ title: t('navigation.newMemberRegistration') }}
        />
        <Stack.Screen
          name="ReportsHome"
          component={ReportsHomeScreen}
          options={{ title: t('navigation.reports') }}
        />
        <Stack.Screen
          name="ReportsListScreen"
          component={ReportsListScreen}
          options={{ title: t('navigation.reportsList') }}
        />
        <Stack.Screen
          name="ReportDetailScreen"
          component={ReportDetailScreen}
          options={{ title: t('navigation.reportDetail') }}
        />
        <Stack.Screen
          name="ReportsScreen"
          component={ReportsScreen}
          options={{ title: t('navigation.createReport') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
