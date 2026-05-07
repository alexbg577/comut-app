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
    height: 85,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    paddingBottom: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16
  },
  tabItem: { alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  tabItemFocused: { backgroundColor: '#eef2ff' },
  tabIcon: { fontSize: 26 },
  tabIconFocused: {},
  tabLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  tabLabelFocused: { color: '#6366f1', fontWeight: '800' }
});
