import admin from "firebase-admin";

var serviceAccount = require("path/to/serviceAccountKey.json");

admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://thecomicalcabient-default-rtdb.asia-southeast1.firebasedatabase.app",
  },
  "server"
);
