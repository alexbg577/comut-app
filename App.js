import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import PublicationScreen from './src/screens/PublicationScreen';
import ShortsScreen from './src/screens/ShortsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import AccountScreen from './src/screens/AccountScreen';
import AuthScreen from './src/screens/AuthScreen';
import UploadScreen from './src/screens/UploadScreen';
import { useAuth } from './src/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { backgroundColor: '#fff' },
        headerStyle: { backgroundColor: '#fff' },
      }}
    >
      <Tab.Screen name="Publications" component={PublicationScreen} options={{ tabBarIcon: ({ color }) => <MaterialIcons name="photo-library" size={24} color={color} /> }} />
      <Tab.Screen name="Shorts" component={ShortsScreen} options={{ tabBarIcon: ({ color }) => <MaterialIcons name="play-circle-filled" size={24} color={color} /> }} />
      <Tab.Screen name="Favoris" component={FavoritesScreen} options={{ tabBarIcon: ({ color }) => <MaterialIcons name="favorite" size={24} color={color} /> }} />
      <Tab.Screen name="Compte" component={AccountScreen} options={{ tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} /> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
              <Stack.Screen name="Upload" component={UploadScreen} options={{ title: 'Upload' }} />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
