require('dotenv').config();
const express = require('express');
const app = express();
const routes = require('./routes/main');
const bodyParser = require('body-parser');
const session = require('express-session');


app.use(session({
  secret: '3287e97828d7b3870992132b6d830f37baa7c41d789315f2e2f41ee4d077c074',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

const port = process.env.PORT || 5000;

app.use('', routes);

app.listen(port, () =>
  console.log(`Server is listening on port ${port}...`)
);
