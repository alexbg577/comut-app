import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Image, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { getFavorites } from '../../services/api';

const CATEGORIES = [
  { key: 'all', label: 'Tous' },
  { key: 'photo', label: '📸 Photos' },
  { key: 'video', label: '🎬 Vidéos' },
  { key: 'music', label: '🎵 Musique' }
];

export default function FavorisScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState('all');

  const fetchFavs = useCallback(async () => {
    try {
      const { data } = await getFavorites();
      setFavorites(data.contents);
    } catch (_) {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchFavs(); }, [fetchFavs]);

  const filtered = category === 'all' ? favorites : favorites.filter(f => f.type === category);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/content-detail', params: { id: item._id } })}
      activeOpacity={0.92}
    >
      {item.type === 'photo' && <Image source={{ uri: item.url }} style={styles.cardImg} resizeMode="cover" />}
      {item.type === 'video' && (
        <View style={styles.videoThumb}>
          {item.thumbnail && <Image source={{ uri: item.thumbnail }} style={styles.cardImg} resizeMode="cover" />}
          <View style={styles.playOverlay}><Text style={{ color: '#fff', fontSize: 28 }}>▶</Text></View>
        </View>
      )}
      {item.type === 'music' && (
        <View style={styles.musicThumb}><Text style={{ fontSize: 40 }}>🎵</Text></View>
      )}
      <View style={styles.cardInfo}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {item.type === 'photo' ? '📸' : item.type === 'video' ? '🎬' : '🎵'}
          </Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'Sans titre'}</Text>
        <Text style={styles.cardMeta}>{item.uploaderId?.pseudo} · {new Date(item.createdAt).toLocaleDateString('fr-FR')}</Text>
        <View style={styles.cardStats}>
          <Text style={styles.statText}>❤️ {item.likes?.length || 0}</Text>
          <Text style={styles.statText}>⭐ Favori</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoris</Text>
        <Text style={styles.headerCount}>{filtered.length} élément{filtered.length !== 1 ? 's' : ''}</Text>
      </View>

      <View style={styles.cats}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={i => i.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.catChip, category === item.key && styles.catChipActive]}
              onPress={() => setCategory(item.key)}
            >
              <Text style={[styles.catChipText, category === item.key && styles.catChipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#6366f1" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFavs(); }} tintColor="#6366f1" />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>⭐</Text>
              <Text style={styles.emptyTitle}>Aucun favori</Text>
              <Text style={styles.emptyText}>Appuyez sur ⭐ sur un contenu pour le retrouver ici.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  headerCount: { fontSize: 13, color: '#9ca3af', fontWeight: '600' },
  cats: { paddingVertical: 12, backgroundColor: '#fff' },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6' },
  catChipActive: { backgroundColor: '#6366f1' },
  catChipText: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  catChipTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', flexDirection: 'row', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  cardImg: { width: 100, height: 100 },
  videoThumb: { width: 100, height: 100, position: 'relative', backgroundColor: '#1f2937' },
  playOverlay: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  musicThumb: { width: 100, height: 100, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, padding: 12, gap: 4 },
  typeBadge: { alignSelf: 'flex-start' },
  typeBadgeText: { fontSize: 16 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cardMeta: { fontSize: 12, color: '#9ca3af' },
  cardStats: { flexDirection: 'row', gap: 12, marginTop: 4 },
  statText: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', paddingHorizontal: 40 }
});
