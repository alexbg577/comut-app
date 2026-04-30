import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  async function handleSubmit() {
    if (!email || !password || (!isLogin && !pseudo)) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, pseudo, password);
        Alert.alert('Success', 'Account created! Please verify your email.');
        setIsLogin(true);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    try {
      await axios.post('https://comut-backend.onrender.com/api/auth/forgot-password', { email });
      Alert.alert('Success', 'Password reset email sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comut</Text>
      <Text style={styles.subtitle}>{isLogin ? 'Login' : 'Create Account'}</Text>

      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      {!isLogin && <TextInput style={styles.input} placeholder="Pseudo" value={pseudo} onChangeText={setPseudo} />}
      <TextInput style={styles.input} placeholder="Password (min 8 chars)" value={password} onChangeText={setPassword} secureTextEntry />

      <Button title={loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')} onPress={handleSubmit} disabled={loading} />

      {isLogin && (
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setPassword(''); }}>
        <Text style={styles.link}>{isLogin ? 'Create an account' : 'Already have an account?'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 40, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#007AFF' },
  subtitle: { fontSize: 24, textAlign: 'center', marginBottom: 30, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  link: { color: '#007AFF', textAlign: 'center', marginTop: 15 }
});
