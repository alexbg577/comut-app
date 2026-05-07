import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Image, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { getContents, likeContent, favoriteContent, deleteContent } from '../../services/api';
import { uploadFile } from '../../services/upload';
import useStore from '../../services/store';

const TYPES = [
  { key: 'all', label: 'Tous' },
  { key: 'photo', label: '📸 Photos' },
  { key: 'video', label: '🎬 Vidéos' },
  { key: 'music', label: '🎵 Musique' }
];
const SORTS = [
  { key: 'recent', label: 'Récent' },
  { key: 'likes', label: '❤️ Aimés' },
  { key: 'oldest', label: 'Ancien' }
];

export default function PublicationScreen() {
  const router = useRouter();
  const { user, isOnline } = useStore();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('recent');
  const [uploadProgress, setUploadProgress] = useState(null);

  const fetchContents = useCallback(async () => {
    try {
      const { data } = await getContents({ type: typeFilter === 'all' ? undefined : typeFilter, sort: sortFilter });
      setContents(data.contents);
    } catch (_) {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [typeFilter, sortFilter]);

  useEffect(() => { fetchContents(); }, [fetchContents]);

  const handlePickAndUpload = async () => {
    Alert.alert('Uploader', 'Choisissez la source', [
      { text: '📷 Galerie (Photo/Vidéo)', onPress: pickFromGallery },
      { text: '📄 Fichier (Musique/ZIP)', onPress: pickDocument },
      { text: 'Annuler', style: 'cancel' }
    ]);
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.9
    });
    if (!result.canceled) doUpload(result.assets[0].uri, result.assets[0].fileName || 'media', result.assets[0].mimeType || 'image/jpeg');
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/*', 'application/zip', 'application/x-zip-compressed'],
      copyToCacheDirectory: true
    });
    if (!result.canceled) doUpload(result.assets[0].uri, result.assets[0].name, result.assets[0].mimeType);
  };

  const doUpload = async (uri, name, mimeType) => {
    setUploadProgress(0);
    try {
      await uploadFile(uri, name, mimeType, name, (p) => setUploadProgress(p));
      setUploadProgress(null);
      fetchContents();
    } catch (e) {
      setUploadProgress(null);
      Alert.alert('Erreur upload', e.message);
    }
  };

  const handleLike = async (id) => {
    try {
      const { data } = await likeContent(id);
      setContents(prev => prev.map(c => c._id === id ? { ...c, likes: data.liked ? [...c.likes, user._id] : c.likes.filter(l => l !== user._id) } : c));
    } catch (_) {}
  };

  const handleFavorite = async (id) => {
    try {
      await favoriteContent(id);
      setContents(prev => prev.map(c => c._id === id ? { ...c, favorites: c.favorites?.includes(user._id) ? c.favorites.filter(f => f !== user._id) : [...(c.favorites || []), user._id] } : c));
    } catch (_) {}
  };

  const handleDelete = (id) => {
    Alert.alert('Supprimer', 'Confirmer la suppression ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try { await deleteContent(id); setContents(prev => prev.filter(c => c._id !== id)); } catch (e) { Alert.alert('Erreur', e.message); }
      }}
    ]);
  };

  const renderItem = ({ item }) => {
    const isLiked = item.likes?.includes(user._id);
    const isFav = item.favorites?.includes(user._id);
    const isOwner = item.uploaderId?._id === user._id || user.role === 'owner';

    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/content-detail', params: { id: item._id } })} activeOpacity={0.95}>
        {item.type === 'photo' && item.url && (
          <Image source={{ uri: item.url }} style={styles.cardImg} resizeMode="cover" />
        )}
        {item.type === 'video' && (
          <View style={styles.videoThumb}>
            {item.thumbnail ? <Image source={{ uri: item.thumbnail }} style={styles.cardImg} resizeMode="cover" /> : null}
            <View style={styles.playOverlay}><Text style={styles.playIcon}>▶</Text></View>
          </View>
        )}
        {item.type === 'music' && (
          <View style={styles.musicCard}>
            <Text style={styles.musicIcon}>🎵</Text>
          </View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarLetter}>{(item.uploaderId?.pseudo || '?')[0].toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.pseudo}>{item.uploaderId?.pseudo || 'Inconnu'}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</Text>
            </View>
            {isOwner && (
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            )}
          </View>

          {item.title ? <Text style={styles.title} numberOfLines={1}>{item.title}</Text> : null}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.action} onPress={() => handleLike(item._id)}>
              <Text style={[styles.actionIcon, isLiked && { color: '#ef4444' }]}>{isLiked ? '❤️' : '🤍'}</Text>
              <Text style={styles.actionCount}>{item.likes?.length || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={() => router.push({ pathname: '/content-detail', params: { id: item._id } })}>
              <Text style={styles.actionIcon}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={() => handleFavorite(item._id)}>
              <Text style={[styles.actionIcon, isFav && { color: '#f59e0b' }]}>{isFav ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comut</Text>
        {!isOnline && <View style={styles.offlineBadge}><Text style={styles.offlineText}>Hors ligne</Text></View>}
        <TouchableOpacity style={styles.uploadBtn} onPress={handlePickAndUpload}>
          <Text style={styles.uploadBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Upload progress */}
      {uploadProgress !== null && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.round(uploadProgress * 100)}%` }]} />
          <Text style={styles.progressText}>Upload {Math.round(uploadProgress * 100)}%</Text>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filtersWrap}>
        <FlatList
          horizontal
          data={TYPES}
          keyExtractor={i => i.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.chip, typeFilter === item.key && styles.chipActive]} onPress={() => setTypeFilter(item.key)}>
              <Text style={[styles.chipText, typeFilter === item.key && styles.chipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.filtersWrap}>
        <FlatList
          horizontal
          data={SORTS}
          keyExtractor={i => i.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.sortChip, sortFilter === item.key && styles.sortChipActive]} onPress={() => setSortFilter(item.key)}>
              <Text style={[styles.sortChipText, sortFilter === item.key && styles.sortChipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Feed */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#6366f1" size="large" />
      ) : (
        <FlatList
          data={contents}
          keyExtractor={i => i._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchContents(); }} tintColor="#6366f1" />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>Rien ici pour l'instant</Text>
              <Text style={styles.emptyText}>Soyez le premier à partager quelque chose dans votre groupe !</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#6366f1', letterSpacing: -0.5 },
  offlineBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  offlineText: { fontSize: 12, color: '#92400e', fontWeight: '600' },
  uploadBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  uploadBtnText: { color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 28 },
  progressBar: { height: 36, backgroundColor: '#eef2ff', margin: 12, borderRadius: 10, justifyContent: 'center', overflow: 'hidden' },
  progressFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#c7d2fe', borderRadius: 10 },
  progressText: { textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#6366f1' },
  filtersWrap: { paddingVertical: 8, backgroundColor: '#fff' },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6' },
  chipActive: { backgroundColor: '#6366f1' },
  chipText: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  sortChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb' },
  sortChipActive: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
  sortChipText: { fontSize: 12, color: '#9ca3af', fontWeight: '600' },
  sortChipTextActive: { color: '#6366f1' },
  card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  cardImg: { width: '100%', height: 220 },
  videoThumb: { position: 'relative' },
  playOverlay: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  playIcon: { color: '#fff', fontSize: 40 },
  musicCard: { height: 100, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  musicIcon: { fontSize: 48 },
  cardBody: { padding: 16, gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#fff', fontWeight: '700', fontSize: 16 },
  pseudo: { fontWeight: '700', color: '#111827', fontSize: 14 },
  date: { fontSize: 12, color: '#9ca3af' },
  deleteBtn: { marginLeft: 'auto', padding: 6 },
  deleteBtnText: { fontSize: 18 },
  title: { fontSize: 15, fontWeight: '600', color: '#374151' },
  actions: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 20 },
  actionCount: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 20 }
});
