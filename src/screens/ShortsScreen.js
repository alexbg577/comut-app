import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, Image, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { postsAPI, groupsAPI } from '../services/api';
import * as ScreenOrientation from 'expo-screen-orientation';

const { height } = Dimensions.get('window');

export default function ShortsScreen() {
  const [shorts, setShorts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) loadShorts();
  }, [selectedGroup]);

  async function loadGroups() {
    try {
      const res = await groupsAPI.getMyGroups();
      setGroups(res.data);
      if (res.data.length > 0) setSelectedGroup(res.data[0]._id);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadShorts() {
    try {
      setLoading(true);
      const res = await postsAPI.getShorts(selectedGroup);
      setShorts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function renderItem({ item }) {
    const isVideo = item.type === 'video';
    return (
      <View style={styles.container}>
        {isVideo ? (
          <Video
            ref={videoRef}
            source={{ uri: item.files?.[0] }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            onFullscreenUpdate={async () => {
              await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            }}
          />
        ) : (
          <Image source={{ uri: item.files?.[0] }} style={styles.media} resizeMode="cover" />
        )}
        {!isVideo && item.backgroundMusic && (
          <Text style={styles.musicNote}>🎵 {item.backgroundMusic.split('/').pop()}</Text>
        )}
        <View style={styles.info}>
          <Text style={styles.author}>{item.author?.pseudo}</Text>
          {item.description && <Text style={styles.desc}>{item.description}</Text>}
        </View>
      </View>
    );
  }

  if (loading) return <ActivityIndicator size="large" style={styles.center} />;

  return (
    <View style={styles.wrapper}>
      <View style={styles.pickerRow}>
        {groups.map(g => (
          <TouchableOpacity key={g._id} onPress={() => setSelectedGroup(g._id)} style={[styles.groupBtn, selectedGroup === g._id && styles.groupActive]}>
            <Text style={selectedGroup === g._id && styles.groupTextActive}>{g.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList data={shorts} renderItem={renderItem} keyExtractor={item => item._id} pagingEnabled vertical />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pickerRow: { flexDirection: 'row', padding: 10, gap: 10 },
  groupBtn: { padding: 8, backgroundColor: '#333', borderRadius: 6 },
  groupActive: { backgroundColor: '#007AFF' },
  groupTextActive: { color: '#fff' },
  container: { height, justifyContent: 'center', alignItems: 'center' },
  media: { width: '100%', height: '100%' },
  musicNote: { position: 'absolute', bottom: 100, left: 20, color: '#fff', fontSize: 16 },
  info: { position: 'absolute', bottom: 50, left: 20, right: 20 },
  author: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  desc: { color: '#fff', marginTop: 5 }
});
