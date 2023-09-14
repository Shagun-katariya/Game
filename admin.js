const firebaseConfig = require('./firebaseconfig.json');
const firebase = require('firebase/app');
require('firebase/database');
const admin = require('./models/admin.js');

firebase.initializeApp(firebaseConfig);

const numberRef = firebase.database().ref('currentNumber');
const currentNumberAdminElement = document.getElementById('current-number-admin');
const updateButton = document.getElementById('update-number');

numberRef.on('value', (snapshot) => {
    const newNumber = snapshot.val();
    currentNumberAdminElement.textContent = newNumber;
});

updateButton.addEventListener('click', () => {
    const newNumber = admin.generateUniqueRandomNumber();
    numberRef.set(newNumber);
});

