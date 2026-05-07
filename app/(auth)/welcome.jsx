import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#6366f1', '#8b5cf6', '#a78bfa']} style={styles.container}>
      <View style={styles.logoWrap}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>C</Text>
        </View>
        <Text style={styles.appName}>Comut</Text>
        <Text style={styles.tagline}>Partagez avec vos proches</Text>
      </View>

      <View style={styles.cardsWrap}>
        <View style={styles.featureRow}>
          {['📸 Photos', '🎵 Musique', '🎬 Vidéos'].map((f) => (
            <View key={f} style={styles.featureChip}>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.btnsWrap}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.btnPrimaryText}>Créer un compte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.btnSecondaryText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 80, paddingHorizontal: 24 },
  logoWrap: { alignItems: 'center', gap: 12 },
  logoCircle: { width: 100, height: 100, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  logoLetter: { fontSize: 52, fontWeight: '800', color: '#fff' },
  appName: { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: '400' },
  cardsWrap: { alignItems: 'center' },
  featureRow: { flexDirection: 'row', gap: 10 },
  featureChip: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  featureText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  btnsWrap: { width: '100%', gap: 12 },
  btnPrimary: { backgroundColor: '#fff', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  btnPrimaryText: { color: '#6366f1', fontWeight: '700', fontSize: 16 },
  btnSecondary: { backgroundColor: 'transparent', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)' },
  btnSecondaryText: { color: '#fff', fontWeight: '600', fontSize: 16 }
});
