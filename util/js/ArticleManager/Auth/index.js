// anotherFile.js

import * as firebaseFunctions from "./firebaseconn";
import LoggedInInfo from "./loggedInInfo";
// Access the functions and variables
export const LoggedData = LoggedInInfo;
export const { app, db, analytics, firebaseConfig, auth, storage } =
  firebaseFunctions;

// Now you can use authFirebase, initializeApp, getDatabase, etc.
