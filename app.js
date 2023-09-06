const express = require('express');
const app = express();
const session = require('express-session');
const routes = require('./routes/main');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.set('view engine', 'ejs');


app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});


app.use('', routes);


const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => console.log('Connected to MongoDb..'))
      .catch((error) => {
        console.log('Error in connecting to mongoDB ' + error);
        throw error;
      });
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
