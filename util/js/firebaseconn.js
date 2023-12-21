import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCc_2anrk45UUAKf8QsiMy-Q2AowCnW6ak",
  authDomain: "thecomicalcabient.firebaseapp.com",
  databaseURL:
    "https://thecomicalcabient-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thecomicalcabient",
  storageBucket: "thecomicalcabient.appspot.com",
  messagingSenderId: "824898717376",
  appId: "1:824898717376:web:e8d04d9c4ff72bd981cf25",
  measurementId: "G-L8BHLXXSS5",
};
let app, db, analytics, auth, storage;

if (typeof window !== "undefined") {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  analytics = getAnalytics(app);
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
}

export { app, db, analytics, firebaseConfig, auth, storage };
