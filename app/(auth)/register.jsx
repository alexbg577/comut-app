import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '../../services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', pseudo: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleRegister = async () => {
    if (!form.email || !form.pseudo || !form.password) return Alert.alert('Erreur', 'Remplissez tous les champs');
    if (form.password.length < 8) return Alert.alert('Erreur', 'Mot de passe minimum 8 caractères');
    if (form.password !== form.confirm) return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');

    setLoading(true);
    try {
      await register({ email: form.email, pseudo: form.pseudo, password: form.password });
      Alert.alert(
        '📧 Vérifiez votre email',
        'Un lien de confirmation a été envoyé à votre adresse email. Cliquez dessus pour activer votre compte.',
        [{ text: 'Se connecter', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 8 ? 1 : form.password.length < 12 ? 2 : 3;
  const strengthColors = ['#e5e7eb', '#ef4444', '#f59e0b', '#10b981'];
  const strengthLabels = ['', 'Faible', 'Moyen', 'Fort'];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez Comut et partagez avec vos proches</Text>

        <View style={styles.form}>
          {[
            { key: 'email', label: 'Adresse email', placeholder: 'vous@exemple.com', keyboard: 'email-address', cap: 'none' },
            { key: 'pseudo', label: 'Pseudo', placeholder: 'Votre pseudo', keyboard: 'default', cap: 'none' }
          ].map(({ key, label, placeholder, keyboard, cap }) => (
            <View key={key} style={styles.field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                value={form[key]}
                onChangeText={(v) => setForm({ ...form, [key]: v })}
                keyboardType={keyboard}
                autoCapitalize={cap}
              />
            </View>
          ))}

          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe <Text style={{ color: '#9ca3af' }}>(min. 8 caractères)</Text></Text>
            <View style={styles.pwdWrap}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={form.password}
                onChangeText={(v) => setForm({ ...form, password: v })}
                secureTextEntry={!showPwd}
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                <Text>{showPwd ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            {form.password.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
                {[1, 2, 3].map(i => (
                  <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: strength >= i ? strengthColors[strength] : '#e5e7eb' }} />
                ))}
                <Text style={{ fontSize: 11, color: strengthColors[strength], fontWeight: '600', marginLeft: 6 }}>{strengthLabels[strength]}</Text>
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={[styles.input, form.confirm && form.confirm !== form.password && { borderColor: '#ef4444' }]}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              value={form.confirm}
              onChangeText={(v) => setForm({ ...form, confirm: v })}
              secureTextEntry={!showPwd}
            />
          </View>

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Création...' : 'Créer mon compte'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.switchText}>Déjà un compte ? <Text style={styles.switchLink}>Se connecter</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  back: { marginBottom: 32, marginTop: 16 },
  backText: { color: '#6366f1', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#6b7280', marginBottom: 36 },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111827' },
  pwdWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingRight: 12 },
  eyeBtn: { padding: 4 },
  btn: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchText: { textAlign: 'center', color: '#6b7280', fontSize: 14, marginTop: 24 },
  switchLink: { color: '#6366f1', fontWeight: '700' }
});
