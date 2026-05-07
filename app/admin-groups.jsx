import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { adminGetGroups, adminDeleteGroup } from '../services/api';

export default function AdminGroupsScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await adminGetGroups();
      setGroups(data.groups);
    } catch (_) {} finally { setLoading(false); }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Supprimer le groupe', `Supprimer "${name}" ? Tout son contenu sera supprimé.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try { await adminDeleteGroup(id); setGroups(prev => prev.filter(g => g._id !== id)); }
        catch (e) { Alert.alert('Erreur', e.message); }
      }}
    ]);
  };

  const renderGroup = ({ item }) => (
    <View style={styles.groupCard}>
      <View style={styles.groupIcon}>
        <Text style={styles.groupIconText}>👥</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupCode}>Code : {item.code}</Text>
        <Text style={styles.groupOwner}>Owner : {item.ownerId?.pseudo} ({item.ownerId?.email})</Text>
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.members?.length || 0} membres</Text>
          </View>
          {item.settings?.sharingEnabled && (
            <View style={[styles.badge, { backgroundColor: '#d1fae5' }]}>
              <Text style={[styles.badgeText, { color: '#059669' }]}>🔗 Partage ON</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id, item.name)}>
        <Text style={styles.deleteBtnText}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Groupes</Text>
        <Text style={styles.headerCount}>{groups.length} groupe(s)</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#6366f1" />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={i => i._id}
          renderItem={renderGroup}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun groupe créé</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 4 },
  backText: { color: '#6366f1', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  headerCount: { fontSize: 13, color: '#9ca3af' },
  groupCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  groupIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  groupIconText: { fontSize: 24 },
  groupName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  groupCode: { fontSize: 12, color: '#6366f1', fontWeight: '700', letterSpacing: 1 },
  groupOwner: { fontSize: 12, color: '#6b7280' },
  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  badge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#6b7280' },
  deleteBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 16 },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 40 }
});
