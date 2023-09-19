const admin = require('firebase-admin');
const serviceAccount = require('../firebase-backend.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://bingo-66659-default-rtdb.firebaseio.com',
});

const firestore = admin.firestore();
const realtimeDb = admin.database();

module.exports = {
  firestore,
  realtimeDb,
};
