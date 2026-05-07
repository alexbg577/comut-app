import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Dimensions, TouchableOpacity,
  ActivityIndicator, Image
} from 'react-native';
import { Video, Audio } from 'expo-av';
import { getShorts, likeContent, favoriteContent } from '../../services/api';
import useStore from '../../services/store';

const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = height;

export default function ShortsScreen() {
  const { user } = useStore();
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getShorts();
        setShorts(data.shorts);
      } catch (_) {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLike = async (id) => {
    const { data } = await likeContent(id);
    setShorts(prev => prev.map(s => s._id === id ? {
      ...s,
      likes: data.liked ? [...(s.likes || []), user._id] : (s.likes || []).filter(l => l !== user._id)
    } : s));
  };

  const handleFav = async (id) => {
    await favoriteContent(id);
    setShorts(prev => prev.map(s => s._id === id ? {
      ...s,
      favorites: (s.favorites || []).includes(user._id)
        ? (s.favorites || []).filter(f => f !== user._id)
        : [...(s.favorites || []), user._id]
    } : s));
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index);
  }, []);

  const renderItem = ({ item, index }) => {
    const isActive = index === activeIndex;
    const isLiked = (item.likes || []).includes(user._id);
    const isFav = (item.favorites || []).includes(user._id);

    return (
      <View style={styles.itemContainer}>
        {item.type === 'video' ? (
          <Video
            source={{ uri: item.url }}
            style={styles.media}
            resizeMode="cover"
            shouldPlay={isActive}
            isLooping
            isMuted={false}
          />
        ) : (
          <View style={styles.photoContainer}>
            <Image source={{ uri: item.url }} style={styles.media} resizeMode="cover" />
            {/* Musique de fond pour les photos */}
            {isActive && item.bgMusic && <BgMusic uri={item.bgMusic} />}
          </View>
        )}

        {/* Overlay gradient */}
        <View style={styles.overlay} />

        {/* Info */}
        <View style={styles.infoWrap}>
          <View style={styles.uploaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{(item.uploaderId?.pseudo || '?')[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.uploaderName}>{item.uploaderId?.pseudo || 'Inconnu'}</Text>
          </View>
          {item.title ? <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text> : null}
          {item.type === 'photo' && item.bgMusic && (
            <View style={styles.musicBadge}><Text style={styles.musicBadgeText}>🎵 Musique en cours</Text></View>
          )}
        </View>

        {/* Sidebar actions */}
        <View style={styles.sidebar}>
          <TouchableOpacity style={styles.sideBtn} onPress={() => handleLike(item._id)}>
            <Text style={[styles.sideBtnIcon, isLiked && { color: '#ff3d60' }]}>{isLiked ? '❤️' : '🤍'}</Text>
            <Text style={styles.sideBtnCount}>{(item.likes || []).length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn} onPress={() => handleFav(item._id)}>
            <Text style={[styles.sideBtnIcon, isFav && { color: '#fbbf24' }]}>{isFav ? '⭐' : '☆'}</Text>
            <Text style={styles.sideBtnCount}>Fav</Text>
          </TouchableOpacity>
          <View style={styles.sideBtn}>
            <Text style={styles.sideBtnIcon}>{item.type === 'video' ? '🎬' : '📸'}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  if (shorts.length === 0) return (
    <View style={styles.loadingWrap}>
      <Text style={{ fontSize: 48 }}>📭</Text>
      <Text style={{ color: '#6b7280', marginTop: 12, fontSize: 16, fontWeight: '600' }}>Aucun contenu pour les shorts</Text>
      <Text style={{ color: '#9ca3af', marginTop: 6, textAlign: 'center', paddingHorizontal: 40 }}>Uploadez des vidéos et photos dans votre groupe pour les voir ici.</Text>
    </View>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={shorts}
      keyExtractor={i => i._id}
      renderItem={renderItem}
      pagingEnabled
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
    />
  );
}

function BgMusic({ uri }) {
  const soundRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true, isLooping: true, volume: 0.4 });
        soundRef.current = sound;
      } catch (_) {}
    })();
    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, [uri]);

  return null;
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', gap: 8 },
  itemContainer: { width, height: ITEM_HEIGHT, backgroundColor: '#000', position: 'relative' },
  media: { ...StyleSheet.absoluteFillObject },
  photoContainer: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, background: 'transparent', backgroundImage: 'linear-gradient(transparent 50%, rgba(0,0,0,0.7))', backgroundColor: 'transparent' },
  infoWrap: { position: 'absolute', bottom: 100, left: 16, right: 80, gap: 8 },
  uploaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  avatarLetter: { color: '#fff', fontWeight: '700', fontSize: 18 },
  uploaderName: { color: '#fff', fontWeight: '700', fontSize: 15, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  itemTitle: { color: '#fff', fontSize: 14, fontWeight: '500', lineHeight: 20, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  musicBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  musicBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  sidebar: { position: 'absolute', right: 12, bottom: 120, gap: 20, alignItems: 'center' },
  sideBtn: { alignItems: 'center', gap: 4 },
  sideBtnIcon: { fontSize: 28, color: '#fff' },
  sideBtnCount: { color: '#fff', fontSize: 12, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }
});
