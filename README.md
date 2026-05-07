# Comut — Application Mobile

Application React Native (Expo) pour le partage privé de médias entre proches.

## Démarrage rapide

```bash
npm install
eas login
eas init
eas build --platform android --profile preview
```

## Structure

```
app/
  (auth)/         → Écrans auth (login, register, groupe)
  (tabs)/         → 4 onglets principaux
  content-detail  → Détail d'un contenu
  group-members   → Gestion membres du groupe
  admin-users     → Admin utilisateurs (owner Comut)
  admin-groups    → Admin groupes (owner Comut)
services/
  api.js          → Appels API backend
  upload.js       → Upload fichiers en arrière-plan
  store.js        → State global (Zustand) + cache offline
```

## Variables d'environnement

Aucune variable dans l'app — tout est dans `services/api.js` (URL du backend).

## Build APK

```bash
eas build --platform android --profile preview
```

Voir le tutoriel complet : https://alexbg577.github.io/comut-web/tutoriel.html
