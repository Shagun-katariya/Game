const connect = require('firebase-admin');
const serviceAccount = require('../private.json');

connect.initializeApp({
  credential: connect.credential.cert(serviceAccount)
});

const db = connect.firestore();

module.exports = db;
