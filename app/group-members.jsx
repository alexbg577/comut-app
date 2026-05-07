import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getMyGroup, promoteAdmin, demoteAdmin, kickMember } from '../services/api';
import useStore from '../services/store';

export default function GroupMembersScreen() {
  const router = useRouter();
  const { user, setGroup } = useStore();
  const [group, setLocalGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchGroup(); }, []);

  const fetchGroup = async () => {
    try {
      const { data } = await getMyGroup();
      setLocalGroup(data.group);
      setGroup(data.group);
    } catch (_) {} finally { setLoading(false); }
  };

  const isGroupOwner = group?.ownerId?._id === user?._id;
  const isGroupAdmin = group?.admins?.some(a => a._id === user?._id);
  const canManage = isGroupOwner || isGroupAdmin || user?.role === 'owner';

  const getMemberRole = (memberId) => {
    if (group?.ownerId?._id === memberId) return 'owner';
    if (group?.admins?.some(a => a._id === memberId)) return 'admin';
    return 'member';
  };

  const handlePromote = (memberId, pseudo) => {
    Alert.alert('Promouvoir', `Promouvoir ${pseudo} en admin ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Promouvoir', onPress: async () => {
        try { await promoteAdmin(memberId); fetchGroup(); } catch (e) { Alert.alert('Erreur', e.message); }
      }}
    ]);
  };

  const handleDemote = (memberId, pseudo) => {
    Alert.alert('Rétrograder', `Rétrograder ${pseudo} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Rétrograder', style: 'destructive', onPress: async () => {
        try { await demoteAdmin(memberId); fetchGroup(); } catch (e) { Alert.alert('Erreur', e.message); }
      }}
    ]);
  };

  const handleKick = (memberId, pseudo) => {
    Alert.alert('Exclure', `Exclure ${pseudo} du groupe ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Exclure', style: 'destructive', onPress: async () => {
        try { await kickMember(memberId); fetchGroup(); } catch (e) { Alert.alert('Erreur', e.message); }
      }}
    ]);
  };

  const RoleBadge = ({ role }) => {
    const config = {
      owner: { bg: '#eef2ff', color: '#6366f1', label: '👑 Owner' },
      admin: { bg: '#d1fae5', color: '#059669', label: '🛡 Admin' },
      member: { bg: '#f3f4f6', color: '#6b7280', label: '👤 Membre' }
    }[role];
    return (
      <View style={[styles.badge, { backgroundColor: config.bg }]}>
        <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
      </View>
    );
  };

  const renderMember = ({ item }) => {
    const role = getMemberRole(item._id);
    const isSelf = item._id === user?._id;
    const isOwnerMember = role === 'owner';

    return (
      <View style={styles.memberCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>{(item.pseudo || '?')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.memberName}>{item.pseudo}{isSelf ? ' (vous)' : ''}</Text>
          <Text style={styles.memberEmail}>{item.email}</Text>
          <RoleBadge role={role} />
        </View>
        {canManage && !isSelf && !isOwnerMember && (
          <View style={styles.memberActions}>
            {isGroupOwner && role === 'member' && (
              <TouchableOpacity style={styles.actionChip} onPress={() => handlePromote(item._id, item.pseudo)}>
                <Text style={styles.actionChipText}>↑ Admin</Text>
              </TouchableOpacity>
            )}
            {isGroupOwner && role === 'admin' && (
              <TouchableOpacity style={[styles.actionChip, styles.actionChipWarn]} onPress={() => handleDemote(item._id, item.pseudo)}>
                <Text style={[styles.actionChipText, { color: '#d97706' }]}>↓ Membre</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionChip, styles.actionChipDanger]} onPress={() => handleKick(item._id, item.pseudo)}>
              <Text style={[styles.actionChipText, { color: '#dc2626' }]}>Exclure</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membres du groupe</Text>
        {group && (
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>Code : {group.code}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#6366f1" />
      ) : (
        <FlatList
          data={group?.members || []}
          keyExtractor={i => i._id}
          renderItem={renderMember}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListHeaderComponent={
            <Text style={styles.countLabel}>{group?.members?.length || 0} membre(s)</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 8 },
  backText: { color: '#6366f1', fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  codeBadge: { backgroundColor: '#eef2ff', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  codeText: { color: '#6366f1', fontWeight: '700', fontSize: 13, letterSpacing: 1 },
  countLabel: { fontSize: 12, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  memberCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#fff', fontWeight: '800', fontSize: 20 },
  memberName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  memberEmail: { fontSize: 12, color: '#9ca3af' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginTop: 2 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  memberActions: { gap: 6, alignItems: 'flex-end' },
  actionChip: { backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  actionChipWarn: { backgroundColor: '#fef3c7' },
  actionChipDanger: { backgroundColor: '#fee2e2' },
  actionChipText: { fontSize: 12, fontWeight: '700', color: '#6366f1' }
});
