import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NetInfo from '@react-native-community/netinfo';
import useStore from '../services/store';

export default function RootLayout() {
  const { user, isLoading, initAuth, setOnline, syncAll } = useStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initAuth();
  }, []);

  // Surveillance réseau
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected;
      setOnline(online);
    });
    return () => unsub();
  }, []);

  // Auth guard
  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) router.replace('/(auth)/welcome');
    else if (user && inAuth) router.replace('/(tabs)/publication');
  }, [user, isLoading, segments]);

  if (isLoading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
