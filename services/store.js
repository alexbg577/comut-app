import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { getMe, getContents, getShorts, getFavorites, getMyGroup } from './api';

const CACHE_KEYS = {
  contents: 'comut_cache_contents',
  shorts: 'comut_cache_shorts',
  favorites: 'comut_cache_favorites',
  group: 'comut_cache_group'
};

const useStore = create((set, get) => ({
  // Auth
  user: null,
  token: null,
  isLoading: true,
  isOnline: true,

  // Data
  contents: [],
  shorts: [],
  favorites: [],
  group: null,

  setOnline: (val) => set({ isOnline: val }),

  initAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('comut_token');
      if (token) {
        set({ token });
        const { data } = await getMe();
        set({ user: data.user });
      }
    } catch (_) {
      // Ne pas supprimer le token si c'est une erreur réseau
    } finally {
      set({ isLoading: false });
    }
  },

  setAuth: async (token, user) => {
    await SecureStore.setItemAsync('comut_token', token);
    set({ token, user });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('comut_token');
    set({ token: null, user: null, group: null, contents: [], shorts: [], favorites: [] });
  },

  updateUser: (user) => set({ user }),

  // Sync data (avec cache offline)
  syncAll: async () => {
    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      // Charger depuis le cache
      try {
        const [c, s, f, g] = await Promise.all([
          AsyncStorage.getItem(CACHE_KEYS.contents),
          AsyncStorage.getItem(CACHE_KEYS.shorts),
          AsyncStorage.getItem(CACHE_KEYS.favorites),
          AsyncStorage.getItem(CACHE_KEYS.group)
        ]);
        set({
          contents: c ? JSON.parse(c) : [],
          shorts: s ? JSON.parse(s) : [],
          favorites: f ? JSON.parse(f) : [],
          group: g ? JSON.parse(g) : null
        });
      } catch (_) {}
      return;
    }

    try {
      const [contentsRes, shortsRes, favsRes, groupRes] = await Promise.allSettled([
        getContents({}),
        getShorts(),
        getFavorites(),
        getMyGroup()
      ]);

      const contents = contentsRes.status === 'fulfilled' ? contentsRes.value.data.contents : get().contents;
      const shorts = shortsRes.status === 'fulfilled' ? shortsRes.value.data.shorts : get().shorts;
      const favorites = favsRes.status === 'fulfilled' ? favsRes.value.data.contents : get().favorites;
      const group = groupRes.status === 'fulfilled' ? groupRes.value.data.group : get().group;

      set({ contents, shorts, favorites, group });

      // Sauvegarder dans le cache
      await Promise.all([
        AsyncStorage.setItem(CACHE_KEYS.contents, JSON.stringify(contents)),
        AsyncStorage.setItem(CACHE_KEYS.shorts, JSON.stringify(shorts)),
        AsyncStorage.setItem(CACHE_KEYS.favorites, JSON.stringify(favorites)),
        AsyncStorage.setItem(CACHE_KEYS.group, JSON.stringify(group))
      ]);
    } catch (_) {}
  },

  setContents: (contents) => set({ contents }),
  setGroup: (group) => set({ group }),
  setFavorites: (favorites) => set({ favorites })
}));

export default useStore;
