import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

const TabIcon = ({ icon, label, focused }) => (
  <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false
      }}
    >
      <Tabs.Screen
        name="publication"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Accueil" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="shorts"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="▶️" label="Shorts" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="favoris"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="❤️" label="Favoris" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="compte"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Compte" focused={focused} />
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
    paddingBottom: 16,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16
  },
  tabItem: { alignItems: 'center', gap: 3, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  tabItemFocused: { backgroundColor: '#eef2ff' },
  tabIcon: { fontSize: 22 },
  tabIconFocused: {},
  tabLabel: { fontSize: 10, color: '#9ca3af', fontWeight: '500' },
  tabLabelFocused: { color: '#6366f1', fontWeight: '700' }
});
