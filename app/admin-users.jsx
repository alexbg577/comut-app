import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { adminGetUsers, adminDeleteUser, adminChangePassword } from '../services/api';

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pwdModal, setPwdModal] = useState(null);
  const [newPwd, setNewPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await adminGetUsers();
      setUsers(data.users);
    } catch (_) {} finally { setLoading(false); }
  };

  const handleDelete = (id, pseudo) => {
    Alert.alert('Supprimer', `Supprimer le compte de ${pseudo} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try { await adminDeleteUser(id); setUsers(prev => prev.filter(u => u._id !== id)); }
        catch (e) { Alert.alert('Erreur', e.message); }
      }}
    ]);
  };

  const handleChangePassword = async () => {
    if (!newPwd || newPwd.length < 8) return Alert.alert('Erreur', 'Minimum 8 caractères');
    setPwdLoading(true);
    try {
      await adminChangePassword(pwdModal._id, newPwd);
      setPwdModal(null); setNewPwd('');
      Alert.alert('✅', 'Mot de passe modifié');
    } catch (e) { Alert.alert('Erreur', e.message); }
    finally { setPwdLoading(false); }
  };

  const filtered = users.filter(u =>
    u.pseudo?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarLetter}>{(item.pseudo || '?')[0].toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.userName}>{item.pseudo}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.metaRow}>
          {item.role === 'owner' && <View style={[styles.badge, { backgroundColor: '#eef2ff' }]}><Text style={[styles.badgeText, { color: '#6366f1' }]}>👑 Owner</Text></View>}
          <View style={[styles.badge, item.emailVerified ? { backgroundColor: '#d1fae5' } : { backgroundColor: '#fee2e2' }]}>
            <Text style={[styles.badgeText, { color: item.emailVerified ? '#059669' : '#dc2626' }]}>
              {item.emailVerified ? '✅ Vérifié' : '❌ Non vérifié'}
            </Text>
          </View>
          {item.groupId && <View style={styles.badge}><Text style={styles.badgeText}>👥 {item.groupId?.name || 'Groupe'}</Text></View>}
        </View>
      </View>
      {item.role !== 'owner' && (
        <View style={styles.actionsCol}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { setPwdModal(item); setNewPwd(''); }}>
            <Text style={styles.actionBtnText}>🔑</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={() => handleDelete(item._id, item.pseudo)}>
            <Text style={styles.actionBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Utilisateurs</Text>
        <Text style={styles.headerCount}>{users.length} compte(s)</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Rechercher un utilisateur..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#6366f1" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i._id}
          renderItem={renderUser}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>}
        />
      )}

      <Modal visible={!!pwdModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔑 Changer le MDP de {pwdModal?.pseudo}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe (min. 8)"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={newPwd}
              onChangeText={setNewPwd}
            />
            <TouchableOpacity style={[styles.btn, pwdLoading && { opacity: 0.6 }]} onPress={handleChangePassword} disabled={pwdLoading}>
              <Text style={styles.btnText}>{pwdLoading ? 'Modification...' : 'Modifier'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setPwdModal(null)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 4 },
  backText: { color: '#6366f1', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  headerCount: { fontSize: 13, color: '#9ca3af' },
  searchWrap: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  searchInput: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111827' },
  userCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#fff', fontWeight: '800', fontSize: 20 },
  userName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  userEmail: { fontSize: 12, color: '#9ca3af' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  badge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#6b7280' },
  actionsCol: { gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  actionBtnDanger: { backgroundColor: '#fee2e2' },
  actionBtnText: { fontSize: 16 },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111827' },
  btn: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: '#9ca3af', fontSize: 15 }
});
