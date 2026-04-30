import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { usersAPI, groupsAPI, authAPI } from '../services/api';
import * as SecureStore from 'expo-secure-store';

export default function AccountScreen() {
  const { user, logout, token } = useAuth();
  const [groups, setGroups] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGroupOptions, setShowGroupOptions] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isComutOwner, setIsComutOwner] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await groupsAPI.getMyGroups();
      setGroups(res.data);
      if (user?.email === 'pelassyalexandre@gmail.com') setIsComutOwner(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function handlePasswordChange() {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await usersAPI.updatePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password updated!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup() {
    if (!newGroupName) return;
    try {
      await groupsAPI.create(newGroupName);
      setNewGroupName('');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to create group');
    }
  }

  async function handleJoinGroup() {
    if (!joinCode) return;
    try {
      await groupsAPI.join(joinCode);
      setJoinCode('');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Invalid code');
    }
  }

  async function handleDeleteAccount() {
    Alert.alert('Confirm', 'Delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await logout();
      }}
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compte</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.pseudo}>{user?.pseudo}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
        <TextInput style={styles.input} placeholder="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
        <TextInput style={styles.input} placeholder="New password (min 8 chars)" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <Button title={loading ? 'Loading...' : 'Update'} onPress={handlePasswordChange} disabled={loading} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Groupes</Text>
        <TouchableOpacity onPress={() => setShowGroupOptions(!showGroupOptions)}>
          <Text style={styles.toggleBtn}>Créer ou rejoindre un groupe</Text>
        </TouchableOpacity>
        {showGroupOptions && (
          <View>
            <TextInput style={styles.input} placeholder="Nom du groupe" value={newGroupName} onChangeText={setNewGroupName} />
            <Button title="Créer" onPress={handleCreateGroup} />
            <TextInput style={styles.input} placeholder="Code de groupe" value={joinCode} onChangeText={setJoinCode} />
            <Button title="Rejoindre" onPress={handleJoinGroup} />
          </View>
        )}
        <FlatList data={groups} keyExtractor={item => item._id} renderItem={({ item }) => (
          <View style={styles.groupItem}>
            <Text>{item.name}</Text>
            <Text style={styles.role}>{item.members?.find(m => m.user?._id === user?._id)?.role}</Text>
          </View>
        )} />
      </View>

      <View style={styles.section}>
        <Button title="Se déconnecter" onPress={logout} color="#ff3b30" />
        <Button title="Supprimer le compte" onPress={handleDeleteAccount} color="#ff3b30" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f5f5f5' },
  title: { fontSize:28, fontWeight:'bold', color:'#333' },
  email: { fontSize:16, color:'#666', marginBottom:5 },
  pseudo: { fontSize:16, color:'#666', marginBottom:20 },
  section: { backgroundColor:'#fff', padding:15, borderRadius:10, marginBottom:15 },
  sectionTitle: { fontSize:18, fontWeight:'bold', marginBottom:10, color:'#333' },
  input: { borderWidth:1, borderColor:'#ddd', padding:10, borderRadius:8, marginBottom:10 },
  toggleBtn: { color:'#007AFF', marginBottom:10 },
  groupItem: { flexDirection:'row', justifyContent:'space-between', padding:10, borderBottomWidth:1, borderColor:'#eee' },
  role: { color:'#007AFF', fontWeight:'bold' }
});
