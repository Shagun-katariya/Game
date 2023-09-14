const admin = require('firebase-admin');
const serviceAccount = require('../firebaseconfig.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: serviceAccount.databaseURL, 
});

const db = admin.firestore();
const realtimeDb = admin.database(); 

module.exports = { firestore: db, realtimeDb }; 
