import React, { useState, useEffect } from 'react';
import { View, FlatList, Image, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { usersAPI } from '../services/api';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFavorites(); }, []);

  async function loadFavorites() {
    try {
      setLoading(true);
      const res = await usersAPI.getFavorites();
      setFavorites(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleFavorite(postId) {
    try {
      await usersAPI.toggleFavorite(postId);
      loadFavorites();
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
          <Text style={styles.label}>🎥 {item.files?.[0]?.split('/').pop()}</Text>
        )}
        {item.type === 'music' && (
          <Text style={styles.label}>🎵 {item.files?.[0]?.split('/').pop()}</Text>
        )}
        <TouchableOpacity onPress={() => handleToggleFavorite(item._id)}>
          <Text style={styles.removeBtn}>Retirer des favoris</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) return <ActivityIndicator size="large" style={styles.center} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Favoris</Text>
      <FlatList data={favorites} renderItem={renderItem} keyExtractor={item => item._id} onRefresh={loadFavorites} refreshing={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: '#f5f5f5', padding: 10 },
  center: { flex:1, justifyContent:'center', alignItems:'center' },
  title: { fontSize:24, fontWeight:'bold', marginBottom:15, color:'#333' },
  card: { backgroundColor:'#fff', padding:15, borderRadius:10, marginBottom:10 },
  author: { fontWeight:'bold', marginBottom:10 },
  image: { width:'100%', height:200, borderRadius:8, marginBottom:10 },
  label: { padding:20, backgroundColor:'#eee', borderRadius:8, textAlign:'center' },
  removeBtn: { color:'#ff3b30', marginTop:10, fontWeight:'bold' }
});
