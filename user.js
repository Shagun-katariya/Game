const firebaseConfig = require('./firebaseconfig.json');
const firebase = require('firebase/app');
require('firebase/database');

firebase.initializeApp(firebaseConfig);

const numberRef = firebase.database().ref('currentNumber');
const currentNumberUserElement = document.getElementById('current-number-user');

numberRef.on('value', (snapshot) => {
    const newNumber = snapshot.val();
    currentNumberUserElement.textContent = newNumber;
});
