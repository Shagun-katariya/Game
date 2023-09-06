const express = require('express');
const router = express.Router();
const googleAuth = require('../dal/google-auth.dal.js');
const passport = require('passport');
const GoogleOAuth2Strategy = require('passport-google-oauth').OAuth2Strategy;
const dotenv = require('dotenv');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../dal/models/user.js')
const twilio = require('twilio');
const twilioConfig = require('../twilioConfig');

let userProfile;

passport.use(
  new GoogleOAuth2Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token is not valid' });
  }
};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

//mobile verification
const client = twilio(twilioConfig.accountSid, twilioConfig.authToken);




// for splash screen
router.get('/', authenticateToken, async (req, res) => {
  // res.render('home');
  // you should use a client-side approach, such as JavaScript on the front-end, to trigger the redirection automatically after some time
})

//for Main menu screen
router.get('/main-menu', async(req,res)=>{
  // res.render('main-menu');
})

//for Main help button
router.get('/help', async(req,res)=>{
  // res.render('help');
})

//for Main setting 
router.get('/setting', async(req,res)=>{
  // res.render('setting');
})


//for login
router.get('/login', async (req, res) => {
  // res.render('login');
})

//for signup
router.get('/signup', async (req, res) => {
  // res.render('signup');
})


/// Temporary storage for OTP
const otpStorage = {};

// Signup route
router.post('/signup', async (req, res) => {
  const { email, password, googleId } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.googleId) {
        return res.status(400).json({ error: 'Email already exists with Google OAuth' });
      }

      if (!existingUser.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUser.password = hashedPassword;
        await existingUser.save();

        const token = jwt.sign({ userId: existingUser._id }, process.env.SESSION_SECRET, {
          expiresIn: '1h',
        });

        return res.status(200).json({ message: 'Email already exists, password set successfully' });
      }

      return res.status(400).json({ error: 'Email already exists with a password' });
    }

    const otp = generateOTP();
    const mobileNumber = req.body.mobileNumber; // You need to pass the mobile number from the frontend

    await client.messages.create({
      body: `Your verification code is: ${otp}`,
      to: mobileNumber,
      from: twilioConfig.phoneNumber,
    });

    otpStorage[email] = otp;

    res.status(200).json({ message: 'OTP sent for verification' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify OTP route
router.post('/verifyotp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (otp === otpStorage[email]) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      delete otpStorage[email]; 
      await user.save();

      const token = jwt.sign({ userId: user._id }, process.env.SESSION_SECRET, {
        expiresIn: '1h',
      });

      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user._id }, process.env.SESSION_SECRET, {
    expiresIn: '1h',
  });

  // res.render('profile', { user: user });
});


router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }), (req, res) => {
  if (req.session && req.session.passport) {
    res.send({
      message: 'You are allowed.',
      'display Name': req.session.passport.user.displayName,
    });
  } else {
    res.json({
      message: 'You are not allowed to access this API endpoint',
      error: 'You are not signed in.',
    });
  }
});

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/google/error' }), (req, res) => {
  res.redirect('/success');
}
);

router.get('/success', async (req, res) => {
  if (req.isAuthenticated()) { // Check if user is authenticated
    const { failure, success } = await googleAuth.registerWithGoogle(userProfile);
    if (failure) console.log('Google user already exists in DB..');
    else console.log('Registering new Google user..');
    // res.render('profile', { user: userProfile });
  } else {
    res.redirect('/error'); // Redirect to an error page
  }
});

router.get('/error', (req, res) => res.send('Error logging in via Google..'));

router.get('/signout', (req, res) => {
  try {
    req.session.destroy(function (err) {
      console.log('session destroyed.');
    });
    res.render('login');
  } catch (err) {
    res.status(400).send({ message: 'Failed to sign out user' });
  }
});

module.exports = router;
