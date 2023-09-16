// <!DOCTYPE html>
// <html>
// <head>
//   <!-- Other HTML head content -->
// </head>
// <body>
//   <!-- Other HTML body content -->

//   <!-- Include the user object as a JavaScript variable -->
//   <script>
//     var user = <%- JSON.stringify(user) %>;
//   </script>

//   <!-- Include your JavaScript file that uses the user object -->
//   <script src="your-script.js"></script>
// </body>
// </html>

// <script src="https://www.gstatic.com/firebasejs/9.5.0/firebase-app-compat.js"></script>
//   <script src="https://www.gstatic.com/firebasejs/9.5.0/firebase-database-compat.js"></script>

// Firebase configuration
const firebaseConfig = require('./firebaseconfig.json');

firebase.initializeApp(firebaseConfig);

const gameStatusRef = firebase.database().ref('gameStatus');

function handleGameStatusChange(status) {
  if (status === 'stopped') {
    if (user.status == 'loser') {
      window.location.href = '/loser-page'; // Redirect to the loser page
    }
  } else {
    // Handle other game statuses or update the UI accordingly
    console.log('Game status is ongoing.');
  }
}

// Listen for changes to the game status
gameStatusRef.on('value', (snapshot) => {
  const gameStatus = snapshot.val();
  handleGameStatusChange(gameStatus);
});

// Replace 'loser-page' with the actual URL where you want to redirect users when the game is stopped
