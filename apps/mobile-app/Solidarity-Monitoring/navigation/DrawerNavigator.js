import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import HomeScreen from '../screens/HomeScreen';
import IndicatorsScreen from '../screens/IndicatorsScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ReportsHomeScreen from '../screens/ReportsHomeScreen';

const Drawer = createDrawerNavigator();

const DEFAULT_PROFILE_IMAGE =
  'http://localhost:4000/uploads/profiles/user_4514539_1784596474857.jpg';

function CustomDrawerContent(props) {
  const { user, logout } = useContext(UserContext);
  const { t } = useTranslation();

  const profileImageUri =
    user?.profileImageUrl || user?.urlImage || DEFAULT_PROFILE_IMAGE;

  const handleLogout = () => {
    Alert.alert(t('navigation.logout'), t('navigation.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.accept'),
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: profileImageUri }}
          style={styles.profileImage}
          resizeMode="cover"
        />
        <Text style={styles.profileName}>{user?.name}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => props.navigation.navigate('EditProfile')}
        >
          <Text style={styles.editProfileText}>{t('navigation.editProfile')}</Text>
        </TouchableOpacity>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label={t('navigation.logout')}
        onPress={handleLogout}
        style={styles.logoutItem}
        labelStyle={styles.logoutLabel}
      />
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  const { t } = useTranslation();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: '#FF6F61',
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: {
          fontSize: 16,
        },
      }}
    >
      <Drawer.Screen
        name="DrawerHome"
        component={HomeScreen}
        options={{ title: t('navigation.home'), drawerLabel: t('navigation.home') }}
      />
      <Drawer.Screen
        name="DrawerIndicators"
        component={IndicatorsScreen}
        options={{ title: t('navigation.indicators'), drawerLabel: t('navigation.indicators') }}
      />
      <Drawer.Screen
        name="DrawerAttendance"
        component={AttendanceScreen}
        options={{ title: t('navigation.attendance'), drawerLabel: t('navigation.attendance') }}
      />
      <Drawer.Screen
        name="DrawerReports"
        component={ReportsHomeScreen}
        options={{ title: t('navigation.reports'), drawerLabel: t('navigation.reports') }}
      />
      <Drawer.Screen
        name="DrawerAdmin"
        component={SettingsScreen}
        options={{
          title: t('navigation.administration'),
          drawerLabel: t('navigation.administration'),
        }}
      />
      <Drawer.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: t('navigation.editProfile'),
          drawerLabel: t('navigation.editProfile'),
          drawerItemStyle: { display: 'none' },
        }}
      />
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
    borderTopColor: '#ccc',
  },
  logoutLabel: {
    color: '#4caf50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
