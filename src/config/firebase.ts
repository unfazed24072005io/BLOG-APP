import { Platform } from 'react-native';

let auth: any, db: any, storage: any, app: any;

if (Platform.OS === 'web') {
  // Web
  const webConfig = require('./firebase.web');
  auth = webConfig.auth;
  db = webConfig.db;
  storage = webConfig.storage;
  app = webConfig.default;
} else {
  // Mobile
  const nativeConfig = require('./firebase.native');
  auth = nativeConfig.firebaseAuth;  // ← Updated
  db = nativeConfig.firestoreDB;     // ← Updated
  storage = nativeConfig.firebaseStorage; // ← Updated
  app = nativeConfig.default;
}

export { auth, db, storage, app };
export default app;