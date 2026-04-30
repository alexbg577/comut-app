import React, { useState, useEffect } from 'react';
import { View, FlatList, Image, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Picker } from 'react-native';
import { postsAPI, groupsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function PublicationScreen() {
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [sort, setSort] = useState('recent');
  const [type, setType] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) loadPosts();
  }, [selectedGroup, sort, type]);

  async function loadGroups() {
    try {
      const res = await groupsAPI.getMyGroups();
      setGroups(res.data);
      if (res.data.length > 0) setSelectedGroup(res.data[0]._id);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadPosts() {
    try {
      setLoading(true);
      const res = await postsAPI.getPosts(selectedGroup, sort, type);
      setPosts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(postId) {
    try {
      await postsAPI.toggleLike(postId);
      loadPosts();
    } catch (error) {
      console.error(error);
    }
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <Text style={styles.author}>{item.author?.pseudo}</Text>
        {item.type === 'photo' && item.files?.map((uri, i) => (
          <Image key={i} source={{ uri }} style={styles.image} />
        ))}
        {item.type === 'video' && (
          <Text style={styles.videoLabel}>🎥 Video: {item.files?.[0]?.split('/').pop()}</Text>
        )}
        {item.type === 'music' && (
          <Text style={styles.musicLabel}>🎵 Music: {item.files?.[0]?.split('/').pop()}</Text>
        )}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleLike(item._id)}>
            <Text>❤️ {item.likesCount || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) return <ActivityIndicator size="large" style={styles.center} />;

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Publications</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Upload')} style={styles.uploadBtn}>
            <Text style={styles.uploadText}>+ Upload</Text>
          </TouchableOpacity>
        </View>
        <Picker selectedValue={selectedGroup} onValueChange={setSelectedGroup} style={styles.picker}>
          {groups.map(g => <Picker.Item key={g._id} label={g.name} value={g._id} />)}
        </Picker>
        <View style={styles.filterRow}>
          {['all', 'photo', 'video', 'music'].map(t => (
            <TouchableOpacity key={t} onPress={() => setType(t)} style={[styles.filterBtn, type === t && styles.filterActive]}>
              <Text style={type === t && styles.filterTextActive}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterRow}>
          {['recent', 'likes'].map(s => (
            <TouchableOpacity key={s} onPress={() => setSort(s)} style={[styles.filterBtn, sort === s && styles.filterActive]}>
              <Text style={sort === s && styles.filterTextActive}>{s === 'likes' ? 'Plus aimé' : 'Récent'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList data={posts} renderItem={renderItem} keyExtractor={item => item._id} refreshing={loading} onRefresh={loadPosts} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex:1, justifyContent:'center', alignItems:'center' },
  filters: { padding:10, backgroundColor:'#fff' },
  headerRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  title: { fontSize:24, fontWeight:'bold', color:'#333' },
  uploadBtn: { backgroundColor:'#007AFF', paddingHorizontal:15, paddingVertical:8, borderRadius:6 },
  uploadText: { color:'#fff', fontWeight:'bold' },
  picker: { height:50 },
  filterRow: { flexDirection: 'row', gap: 10, marginVertical: 5 },
  filterBtn: { padding: 8, borderRadius: 6, backgroundColor: '#eee' },
  filterActive: { backgroundColor: '#007AFF' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 10 },
  author: { fontWeight: 'bold', marginBottom: 10 },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 10 },
  videoLabel: { padding: 20, backgroundColor: '#eee', borderRadius: 8, textAlign: 'center' },
  musicLabel: { padding: 20, backgroundColor: '#f0f0f0', borderRadius: 8, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 20, marginTop: 10 }
});
