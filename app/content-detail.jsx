import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
  TextInput, Alert, KeyboardAvoidingView, Platform, Dimensions, Share
} from 'react-native';
import { Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getContents, getComments, addComment, deleteComment, likeContent, favoriteContent, likeComment } from '../services/api';
import useStore from '../services/store';

const { width } = Dimensions.get('window');

export default function ContentDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, group } = useStore();
  const [content, setContent] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchContent();
    fetchComments();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [id]);

  const fetchContent = async () => {
    try {
      const { data } = await getContents({});
      const found = data.contents.find(c => c._id === id);
      setContent(found);
    } catch (_) {}
  };

  const fetchComments = async () => {
    try {
      const { data } = await getComments(id);
      setComments(data.comments);
    } catch (_) {}
  };

  const handleLike = async () => {
    try {
      const { data } = await likeContent(id);
      setContent(prev => ({
        ...prev,
        likes: data.liked ? [...prev.likes, user._id] : prev.likes.filter(l => l !== user._id)
      }));
    } catch (_) {}
  };

  const handleFav = async () => {
    try {
      await favoriteContent(id);
      setContent(prev => ({
        ...prev,
        favorites: (prev.favorites || []).includes(user._id)
          ? prev.favorites.filter(f => f !== user._id)
          : [...(prev.favorites || []), user._id]
      }));
    } catch (_) {}
  };

  const handleShare = async () => {
    if (!group?.settings?.sharingEnabled && user?.role !== 'owner') {
      return Alert.alert('Partage désactivé', "L'owner du groupe n'a pas activé le partage externe.");
    }
    try {
      await Share.share({ message: `Regarde ça sur Comut : ${content?.url}`, url: content?.url });
    } catch (_) {}
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      const { data } = await addComment({ contentId: id, text: commentText.trim() });
      setComments(prev => [data.comment, ...prev]);
      setCommentText('');
    } catch (e) { Alert.alert('Erreur', e.message); }
    finally { setLoading(false); }
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert('Supprimer', 'Supprimer ce commentaire ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await deleteComment(commentId);
          setComments(prev => prev.filter(c => c._id !== commentId));
        } catch (e) { Alert.alert('Erreur', e.message); }
      }}
    ]);
  };

  const handleLikeComment = async (commentId) => {
    try {
      const { data } = await likeComment(commentId);
      setComments(prev => prev.map(c => c._id === commentId ? {
        ...c,
        likes: data.liked ? [...(c.likes || []), user._id] : (c.likes || []).filter(l => l !== user._id)
      } : c));
    } catch (_) {}
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
    setIsFullscreen(!isFullscreen);
  };

  if (!content) return (
    <View style={styles.loadingWrap}>
      <Text style={{ fontSize: 24 }}>⏳</Text>
      <Text style={{ color: '#6b7280', marginTop: 8 }}>Chargement...</Text>
    </View>
  );

  const isLiked = (content.likes || []).includes(user._id);
  const isFav = (content.favorites || []).includes(user._id);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        {/* Back */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>Partager 🔗</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Media */}
          {content.type === 'video' && (
            <View style={styles.videoWrap}>
              <Video
                ref={videoRef}
                source={{ uri: content.url }}
                style={isFullscreen ? styles.videoFullscreen : styles.video}
                useNativeControls
                resizeMode="contain"
                shouldPlay
              />
              <TouchableOpacity style={styles.fullscreenBtn} onPress={toggleFullscreen}>
                <Text style={styles.fullscreenBtnText}>{isFullscreen ? '⊡' : '⛶'}</Text>
              </TouchableOpacity>
            </View>
          )}
          {content.type === 'photo' && (
            <TouchableOpacity activeOpacity={0.95} onPress={toggleFullscreen}>
              <Image
                source={{ uri: content.url }}
                style={isFullscreen ? styles.imgFullscreen : styles.img}
                resizeMode={isFullscreen ? 'contain' : 'cover'}
              />
              <View style={styles.fullscreenHint}>
                <Text style={styles.fullscreenHintText}>{isFullscreen ? '⊡ Réduire' : '⛶ Plein écran'}</Text>
              </View>
            </TouchableOpacity>
          )}
          {content.type === 'music' && (
            <View style={styles.musicPlayer}>
              <Text style={styles.musicPlayerIcon}>🎵</Text>
              <Text style={styles.musicPlayerTitle}>{content.title}</Text>
              <Video source={{ uri: content.url }} useNativeControls style={{ width: '100%', height: 50 }} />
            </View>
          )}

          {/* Info */}
          <View style={styles.info}>
            <View style={styles.uploaderRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>{(content.uploaderId?.pseudo || '?')[0].toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.uploaderName}>{content.uploaderId?.pseudo}</Text>
                <Text style={styles.uploadDate}>{new Date(content.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
              </View>
            </View>
            {content.title ? <Text style={styles.contentTitle}>{content.title}</Text> : null}

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                <Text style={[styles.actionBtnIcon, isLiked && { color: '#ef4444' }]}>{isLiked ? '❤️' : '🤍'}</Text>
                <Text style={styles.actionBtnLabel}>{(content.likes || []).length} J'aime</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleFav}>
                <Text style={[styles.actionBtnIcon, isFav && { color: '#f59e0b' }]}>{isFav ? '⭐' : '☆'}</Text>
                <Text style={styles.actionBtnLabel}>{isFav ? 'Favori' : 'Ajouter'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                <Text style={styles.actionBtnIcon}>🔗</Text>
                <Text style={styles.actionBtnLabel}>Partager</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Commentaires */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsSectionTitle}>💬 Commentaires ({comments.length})</Text>
            {comments.map(c => {
              const canDelete = c.authorId?._id === user._id || user.role === 'owner';
              const commentLiked = (c.likes || []).includes(user._id);
              return (
                <View key={c._id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarLetter}>{(c.authorId?.pseudo || '?')[0].toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.commentAuthor}>{c.authorId?.pseudo}</Text>
                      <Text style={styles.commentDate}>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</Text>
                    </View>
                    {canDelete && (
                      <TouchableOpacity onPress={() => handleDeleteComment(c._id)}>
                        <Text style={{ fontSize: 16, color: '#d1d5db' }}>🗑</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.commentText}>{c.text}</Text>
                  <TouchableOpacity style={styles.commentLikeBtn} onPress={() => handleLikeComment(c._id)}>
                    <Text style={[styles.commentLikeIcon, commentLiked && { color: '#ef4444' }]}>{commentLiked ? '❤️' : '🤍'}</Text>
                    <Text style={styles.commentLikeCount}>{(c.likes || []).length}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Input commentaire */}
        <View style={styles.commentInputWrap}>
          <View style={styles.commentAvatarSmall}>
            <Text style={styles.commentAvatarSmallLetter}>{(user?.pseudo || '?')[0].toUpperCase()}</Text>
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor="#9ca3af"
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!commentText.trim() || loading) && { opacity: 0.4 }]}
            onPress={handleSendComment}
            disabled={!commentText.trim() || loading}
          >
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { padding: 4 },
  backBtnText: { color: '#6366f1', fontSize: 16, fontWeight: '600' },
  shareBtn: { padding: 4 },
  shareBtnText: { color: '#6366f1', fontSize: 14, fontWeight: '600' },
  videoWrap: { position: 'relative', backgroundColor: '#000' },
  video: { width, height: 240 },
  videoFullscreen: { width: '100%', height: 400 },
  fullscreenBtn: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: 6 },
  fullscreenBtnText: { color: '#fff', fontSize: 18 },
  img: { width, height: 280 },
  imgFullscreen: { width, height: 420 },
  fullscreenHint: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  fullscreenHintText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  musicPlayer: { padding: 24, backgroundColor: '#eef2ff', alignItems: 'center', gap: 12 },
  musicPlayerIcon: { fontSize: 56 },
  musicPlayerTitle: { fontSize: 16, fontWeight: '700', color: '#4338ca' },
  info: { backgroundColor: '#fff', padding: 16, gap: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  uploaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#fff', fontWeight: '700', fontSize: 20 },
  uploaderName: { fontWeight: '700', color: '#111827', fontSize: 15 },
  uploadDate: { fontSize: 12, color: '#9ca3af' },
  contentTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  actionsRow: { flexDirection: 'row', gap: 20 },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionBtnIcon: { fontSize: 26 },
  actionBtnLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  commentsSection: { padding: 16, gap: 12 },
  commentsSectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  commentCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 8, borderWidth: 1, borderColor: '#f3f4f6' },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  commentAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  commentAvatarLetter: { color: '#fff', fontWeight: '700', fontSize: 15 },
  commentAuthor: { fontWeight: '700', color: '#111827', fontSize: 13 },
  commentDate: { fontSize: 11, color: '#9ca3af' },
  commentText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  commentLikeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  commentLikeIcon: { fontSize: 16 },
  commentLikeCount: { fontSize: 12, color: '#9ca3af', fontWeight: '600' },
  commentInputWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', padding: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  commentAvatarSmall: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  commentAvatarSmallLetter: { color: '#fff', fontWeight: '700', fontSize: 15 },
  commentInput: { flex: 1, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827', maxHeight: 80 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontSize: 16 }
});
