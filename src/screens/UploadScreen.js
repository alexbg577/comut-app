import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Picker, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { groupsAPI, postsAPI } from '../services/api';

export default function UploadScreen({ navigation }) {
  const [files, setFiles] = useState([]);
  const [type, setType] = useState('photo');
  const [group, setGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadGroups(); }, []);

  async function loadGroups() {
    try {
      const res = await groupsAPI.getMyGroups();
      setGroups(res.data);
      if (res.data.length > 0) setGroup(res.data[0]._id);
    } catch (error) { console.error(error); }
  }

  async function pickFiles() {
    try {
      if (type === 'photo' || type === 'video') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: type === 'photo' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
          allowsMultipleSelection: true
        });
        if (!result.canceled) {
          setFiles(result.assets.map(a => ({ uri: a.uri, name: a.fileName || 'file', type: a.mimeType }));
        }
      } else {
        Alert.alert('Info', 'For music files, use document picker');
      }
    } catch (error) { console.error(error); }
  }

  async function handleUpload() {
    if (files.length === 0 || !group) {
      Alert.alert('Error', 'Please select files and group');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('groupId', group);
      files.forEach((file, i) => formData.append('files', { uri: file.uri, name: file.name, type: file.type }));

      await postsAPI.createPost(formData);
      Alert.alert('Success', 'Files uploaded in background!');
      setFiles([]);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Content</Text>
      <Text style={styles.label}>Type:</Text>
      <Picker selectedValue={type} onValueChange={setType}>
        <Picker.Item label="Photo" value="photo" />
        <Picker.Item label="Video" value="video" />
        <Picker.Item label="Music" value="music" />
      </Picker>
      <Text style={styles.label}>Group:</Text>
      <Picker selectedValue={group} onValueChange={setGroup}>
        {groups.map(g => <Picker.Item key={g._id} label={g.name} value={g._id} />)}
      </Picker>
      <TouchableOpacity style={styles.pickBtn} onPress={pickFiles}>
        <Text style={styles.btnText}>Pick Files ({files.length})</Text>
      </TouchableOpacity>
      {files.map((f, i) => <Text key={i} style={styles.fileName}>{f.name}</Text>)}
      <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} disabled={uploading}>
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Upload</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f5f5f5' },
  title: { fontSize:24, fontWeight:'bold', marginBottom:20, color:'#333' },
  label: { fontSize:16, marginBottom:5, color:'#666' },
  pickBtn: { backgroundColor:'#007AFF', padding:15, borderRadius:8, alignItems:'center', marginVertical:10 },
  uploadBtn: { backgroundColor:'#34C759', padding:15, borderRadius:8, alignItems:'center', marginTop:20 },
  btnText: { color:'#fff', fontWeight:'bold', fontSize:16 },
  fileName: { fontSize:14, color:'#666', marginTop:5 }
});
