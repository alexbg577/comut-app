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
    height: 88,
    backgroundColor: '#fafbff',
    borderTopWidth: 2,
    borderTopColor: '#e0e7ff',
    paddingTop: 6,
    paddingBottom: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 20
  },
  tabItem: { alignItems: 'center', gap: 3, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 14, minWidth: 64 },
  tabItemFocused: { backgroundColor: '#6366f1' },
  tabIcon: { fontSize: 28 },
  tabIconFocused: {},
  tabLabel: { fontSize: 12, color: '#6b7280', fontWeight: '700' },
  tabLabelFocused: { color: '#fff', fontWeight: '800' }
});
