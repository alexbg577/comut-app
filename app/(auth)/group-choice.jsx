import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { createGroup, joinGroup } from '../../services/api';
import useStore from '../../services/store';

export default function GroupChoiceScreen() {
  const router = useRouter();
  const { setGroup, updateUser, user } = useStore();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // 'create' | 'join'
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');

  const handleCreate = async () => {
    if (!groupName.trim()) return Alert.alert('Erreur', 'Entrez un nom de groupe');
    setLoading(true);
    try {
      const { data } = await createGroup(groupName.trim());
      setGroup(data.group);
      updateUser({ ...user, groupId: data.group._id });
      setModal(null);
      router.replace('/(tabs)/publication');
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!groupCode.trim()) return Alert.alert('Erreur', 'Entrez un code');
    setLoading(true);
    try {
      const { data } = await joinGroup(groupCode.trim().toUpperCase());
      setGroup(data.group);
      updateUser({ ...user, groupId: data.group._id });
      setModal(null);
      router.replace('/(tabs)/publication');
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoCircle}><Text style={styles.logoLetter}>C</Text></View>
        <Text style={styles.title}>Bienvenue, {user?.pseudo} ! 👋</Text>
        <Text style={styles.subtitle}>Pour commencer, créez ou rejoignez un groupe avec vos proches.</Text>
      </View>

      <View style={styles.cards}>
        <TouchableOpacity style={styles.card} onPress={() => setModal('create')}>
          <Text style={styles.cardIcon}>✨</Text>
          <Text style={styles.cardTitle}>Créer un groupe</Text>
          <Text style={styles.cardDesc}>Créez un espace privé et invitez vos proches via un code unique.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.cardSecondary]} onPress={() => setModal('join')}>
          <Text style={styles.cardIcon}>🔗</Text>
          <Text style={styles.cardTitle}>Rejoindre un groupe</Text>
          <Text style={styles.cardDesc}>Entrez le code partagé par votre proche pour rejoindre son espace.</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Créer */}
      <Modal visible={modal === 'create'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>✨ Créer un groupe</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom du groupe (ex: Famille Martin)"
              placeholderTextColor="#9ca3af"
              value={groupName}
              onChangeText={setGroupName}
            />
            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleCreate} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Création...' : 'Créer le groupe'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(null)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Rejoindre */}
      <Modal visible={modal === 'join'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔗 Rejoindre un groupe</Text>
            <TextInput
              style={[styles.input, { textTransform: 'uppercase', letterSpacing: 4, textAlign: 'center', fontSize: 22, fontWeight: '700' }]}
              placeholder="CODE"
              placeholderTextColor="#9ca3af"
              value={groupCode}
              onChangeText={setGroupCode}
              maxLength={6}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleJoin} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Recherche...' : 'Rejoindre'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(null)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  header: { alignItems: 'center', marginTop: 60, marginBottom: 48, gap: 12 },
  logoCircle: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  logoLetter: { fontSize: 36, fontWeight: '800', color: '#fff' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22 },
  cards: { gap: 16 },
  card: { backgroundColor: '#6366f1', borderRadius: 20, padding: 24, gap: 8 },
  cardSecondary: { backgroundColor: '#f0fdf4', borderWidth: 1.5, borderColor: '#bbf7d0' },
  cardIcon: { fontSize: 32 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  cardDesc: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111827' },
  btn: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: '#9ca3af', fontSize: 15 }
});
