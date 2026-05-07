import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Modal, TextInput, Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  changePassword, getMyGroup, leaveGroup, promoteAdmin,
  demoteAdmin, kickMember, updateGroupSettings
} from '../../services/api';
import { adminGetStats } from '../../services/api';
import useStore from '../../services/store';

export default function CompteScreen() {
  const router = useRouter();
  const { user, logout, group, setGroup } = useStore();
  const [pwdModal, setPwdModal] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [sharingEnabled, setSharingEnabled] = useState(group?.settings?.sharingEnabled || false);

  const isAppOwner = user?.role === 'owner';
  const isGroupOwner = group && group.ownerId?._id === user?._id;
  const isGroupAdmin = group?.admins?.some(a => a._id === user?._id);

  useEffect(() => {
    if (isAppOwner) {
      adminGetStats().then(r => setStats(r.data)).catch(() => {});
    }
  }, [isAppOwner]);

  const handleChangePassword = async () => {
    if (!oldPwd || !newPwd) return Alert.alert('Erreur', 'Remplissez tous les champs');
    if (newPwd.length < 8) return Alert.alert('Erreur', 'Minimum 8 caractères');
    setPwdLoading(true);
    try {
      await changePassword({ oldPassword: oldPwd, newPassword: newPwd });
      setPwdModal(false); setOldPwd(''); setNewPwd('');
      Alert.alert('✅', 'Mot de passe modifié avec succès');
    } catch (e) { Alert.alert('Erreur', e.message); }
    finally { setPwdLoading(false); }
  };

  const handleLeaveGroup = () => {
    if (isGroupOwner) return Alert.alert('Impossible', "L'owner ne peut pas quitter son groupe. Supprimez le groupe depuis le panneau admin.");
    Alert.alert('Quitter le groupe', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Quitter', style: 'destructive', onPress: async () => {
        try { await leaveGroup(); setGroup(null); } catch (e) { Alert.alert('Erreur', e.message); }
      }}
    ]);
  };

  const handleToggleSharing = async (val) => {
    setSharingEnabled(val);
    try { await updateGroupSettings({ sharingEnabled: val }); } catch (e) { setSharingEnabled(!val); Alert.alert('Erreur', e.message); }
  };

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const Row = ({ icon, label, value, onPress, color, isSwitch, switchVal, onToggle }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress && !isSwitch} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, color && { color }]}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
      {isSwitch ? <Switch value={switchVal} onValueChange={onToggle} trackColor={{ true: '#6366f1' }} /> : onPress ? <Text style={styles.chevron}>›</Text> : null}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header profil */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarBig}>
          <Text style={styles.avatarBigLetter}>{(user?.pseudo || '?')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.profileName}>{user?.pseudo}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        {isAppOwner && (
          <View style={styles.ownerBadge}><Text style={styles.ownerBadgeText}>👑 Owner Comut</Text></View>
        )}
        {!isAppOwner && isGroupOwner && (
          <View style={[styles.ownerBadge, { backgroundColor: '#fef3c7' }]}><Text style={[styles.ownerBadgeText, { color: '#92400e' }]}>⭐ Owner du groupe</Text></View>
        )}
        {!isAppOwner && !isGroupOwner && isGroupAdmin && (
          <View style={[styles.ownerBadge, { backgroundColor: '#d1fae5' }]}><Text style={[styles.ownerBadgeText, { color: '#065f46' }]}>🛡 Admin du groupe</Text></View>
        )}
      </View>

      {/* Groupe */}
      {group ? (
        <Section title="Mon groupe">
          <Row icon="👥" label={group.name} value={`Code: ${group.code}`} />
          <Row icon="👤" label="Membres" value={`${group.members?.length || 0} membre(s)`} onPress={() => router.push('/group-members')} />
          {(isGroupOwner || isGroupAdmin) && (
            <Row icon="⚙️" label="Gérer les membres" onPress={() => router.push('/group-members')} />
          )}
          {isGroupOwner && (
            <Row
              icon="🔗"
              label="Partage externe"
              isSwitch
              switchVal={sharingEnabled}
              onToggle={handleToggleSharing}
            />
          )}
          <Row icon="🚪" label="Quitter le groupe" color="#ef4444" onPress={handleLeaveGroup} />
        </Section>
      ) : (
        <Section title="Groupe">
          <Row icon="➕" label="Créer ou rejoindre un groupe" onPress={() => router.push('/(auth)/group-choice')} />
        </Section>
      )}

      {/* Compte */}
      <Section title="Compte">
        <Row icon="🔑" label="Changer le mot de passe" onPress={() => setPwdModal(true)} />
      </Section>

      {/* Admin Comut */}
      {isAppOwner && (
        <Section title="🔐 Administration Comut">
          {stats && (
            <View style={styles.statsRow}>
              {[{ label: 'Utilisateurs', val: stats.users, icon: '👤' }, { label: 'Groupes', val: stats.groups, icon: '👥' }, { label: 'Contenus', val: stats.contents, icon: '📁' }].map(s => (
                <View key={s.label} style={styles.statCard}>
                  <Text style={styles.statCardIcon}>{s.icon}</Text>
                  <Text style={styles.statCardVal}>{s.val}</Text>
                  <Text style={styles.statCardLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}
          <Row icon="👤" label="Gérer les utilisateurs" onPress={() => router.push('/admin-users')} />
          <Row icon="👥" label="Gérer les groupes" onPress={() => router.push('/admin-groups')} />
        </Section>
      )}

      {/* Déconnexion */}
      <Section title="Session">
        <Row icon="🚪" label="Se déconnecter" color="#ef4444" onPress={() => {
          Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Déconnecter', style: 'destructive', onPress: logout }
          ]);
        }} />
      </Section>

      {/* Modal Changer MDP */}
      <Modal visible={pwdModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔑 Changer le mot de passe</Text>
            <TextInput style={styles.input} placeholder="Ancien mot de passe" placeholderTextColor="#9ca3af" secureTextEntry value={oldPwd} onChangeText={setOldPwd} />
            <TextInput style={styles.input} placeholder="Nouveau mot de passe (min. 8)" placeholderTextColor="#9ca3af" secureTextEntry value={newPwd} onChangeText={setNewPwd} />
            <TouchableOpacity style={[styles.btn, pwdLoading && { opacity: 0.6 }]} onPress={handleChangePassword} disabled={pwdLoading}>
              <Text style={styles.btnText}>{pwdLoading ? 'Modification...' : 'Modifier'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setPwdModal(false); setOldPwd(''); setNewPwd(''); }}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  profileHeader: { alignItems: 'center', backgroundColor: '#fff', paddingTop: 60, paddingBottom: 28, gap: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  avatarBig: { width: 88, height: 88, borderRadius: 24, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  avatarBigLetter: { color: '#fff', fontSize: 40, fontWeight: '800' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 4 },
  profileEmail: { fontSize: 14, color: '#9ca3af' },
  ownerBadge: { backgroundColor: '#eef2ff', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 4 },
  ownerBadgeText: { color: '#6366f1', fontWeight: '700', fontSize: 13 },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 },
  sectionContent: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  rowIcon: { fontSize: 20, width: 28 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  rowValue: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  chevron: { fontSize: 20, color: '#d1d5db', fontWeight: '300' },
  statsRow: { flexDirection: 'row', gap: 8, padding: 12 },
  statCard: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  statCardIcon: { fontSize: 20 },
  statCardVal: { fontSize: 22, fontWeight: '800', color: '#6366f1' },
  statCardLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111827' },
  btn: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: '#9ca3af', fontSize: 15 }
});
