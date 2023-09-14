const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });
const User = require('../models/user.js');
const schedule = require('../models/schedule.js');
const admin = require('../models/admin.js');
const twilio = require('twilio');
const twilioConfig = require('../twilioConfig');


// for splash screen
router.get('/', async (req, res) => {
  // res.render('home');
  // you should use a client-side approach, such as JavaScript on the front-end, to trigger the redirection automatically after some time
})

//for Main menu screen
router.get('/main-menu', async (req, res) => {
  // res.render('main-menu');
})

//for Main help button
router.get('/help', async (req, res) => {
  // res.render('help');
})

//for Main setting 
router.get('/setting', async (req, res) => {
  // res.render('setting');
})


//for login using mobile number
router.get('/login', async (req, res) => {
  // res.render('login');
})

const client = twilio(twilioConfig.accountSid, twilioConfig.authToken);

router.post('/userlogin', (req, res) => {
  const { mobileNumber } = req.body;
  req.session.mobileNumber = mobileNumber;

  if (!mobileNumber) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  let otp = Math.floor(100000 + Math.random() * 900000).toString();
  req.session.otp = otp;

  client.messages.create({
    body: `Your OTP is: ${otp}`,
    to: mobileNumber,
    from: twilioConfig.phoneNumber
  })
    .then((message) => {
      console.log(message.sid);
      res.render('match-otp');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send({ status: 'error', message: error.message });
    });
});


router.get('/admin', (req, res) => {
  res.render('/admin');
})

router.post('/admin/login', async (req, res) => {
  const { mobileNumber } = req.body;
  req.session.mobileNumber = mobileNumber;

  if (!mobileNumber) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  try {
    const doc = await admin.findOne(mobileNumber);

    if (!doc) {
      return res.status(404).json({ message: 'You are not an admin' });
    }

    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.otp = otp;

    client.messages.create({
      body: `Your OTP is: ${otp}`,
      to: mobileNumber,
      from: twilioConfig.phoneNumber
    })
      .then((message) => {
        console.log(message.sid);
        res.render('match-otp');
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: error.message });
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/match-otp', (req, res) => {
  res.render('match-otp');
})


router.post('/resendOTP', (req, res) => {
  let otp = Math.floor(100000 + Math.random() * 900000).toString();
  req.session.otp = otp;

  client.messages.create({
    body: `Your OTP is: ${otp}`,
    to: req.session.mobileNumber,
    from: twilioConfig.phoneNumber
  })
    .then((message) => {
      console.log(message.sid);
      res.render('match-otp');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send({ status: 'error', message: error.message });
    });
});

router.post('/verify-otp', (req, res) => {
  const { otp } = req.body;

  if (req.session.otp === otp) {
    req.session.otp = null;
    res.redirect('/profile');
  } else {
    res.status(400).send({ status: 'error', message: 'Invalid OTP' });
  }
});



router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.render('/login');
  });
});



router.get('/profile', async (req, res) => {
  const mobileNumber = req.session.mobileNumber;

  try {
    const user = await User.findOne(mobileNumber);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.render('profile', { user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.put('/profile', async (req, res) => {
  const { imageUrl, username, birthday } = req.body;
  const mobileNumber = req.session.mobileNumber;

  if (!imageUrl || !username || !birthday) {
    return res.status(400).json({ message: 'Image URL, username and birthday are required' });
  }

  try {
    const user = await User.findOne(mobileNumber);
    const age = new Date().getFullYear() - new Date(birthday).getFullYear();

    if (age < 18) {
      return res.redirect('/less-age');
    }

    user.imageUrl = imageUrl;
    user.username = username;
    user.birthday = birthday;

    await user.save();
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



router.get('/less-age', (req, res) => {
  res.render('less-age')
})


router.get('/home', (req, res) => {
  const Schedule = schedule.findOne({});
  res.render('home', { slot: Schedule });
})




async function generateRandomGrid(m, min = 1, max = 99) {
  const numbers = [];
  const Schedule = await schedule.findOne({});

  for (let i = min; i <= max; i++) {
    numbers.push(i);
  }

  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  const grid = [];
  let index = 0;
  for (let i = 0; i < m; i++) {
    const row = [];
    for (let j = 0; j < m; j++) {
      if (i === Math.floor(m / 2) && j === Math.floor(m / 2)) {
        row.push(Schedule.sponsorship);
      }
      else {
        row.push(numbers[index]);
        index++;
      }
    }
    grid.push(row);
  }

  return grid;
}

router.post('/register', async (req, res) => {
  try {
    const Schedule = await schedule.findOne();
    if (schedule.registered <= 5000) {
      const user = await User.findOne(req.session.mobileNumber);
      if (user) {
        if (user.booleanVariable == true) {
          return res.status(404).json({ message: 'User already registered' });
        }
        user.booleanVariable = true;
        user.grid = generateRandomGrid(Schedule.gridSize);
        await user.save();
        Schedule.registered++;
        await Schedule.save();
        res.redirect('set-reminder');
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      res.status(400).json({ message: 'Registration limit reached' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/set-reminder', async (req, res) => {
  res.render('set-reminder')
})




router.get('/enter-the-game', async (req, res) => {
  const mobileNumber = req.session.mobileNumber;
  const user = await User.findOne(mobileNumber);
  try {
    res.render('enter-the-game', { user: user, });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


router.post('/winner', async (req, res) => {
  try {
    const user = await User.findOne(req.session.mobileNumber);
    if (user) {
      await user.winGame();
      res.status(200).send('User has won the game and their mobile number has been added to the admin database.');
    } else {
      res.status(404).send('User not found.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred.');
  }
});


router.post('/stop-game', async (req, res) => {
  const admin = await admin.findOne(req.session.mobileNumber);
  if (admin) {
    await admin.stopGame();
    res.send({ message: 'Game stopped.' });
  } else {
    res.status(404).send({ message: 'Admin not found.' });
  }
});


// db.collection('game').doc('status')
//   .onSnapshot((doc) => {
//     if (doc.data().gameStopped) {
//       if (user.status === 'loser') {
//         window.location.href = '/loser-page';
//       } 
//     }
// });


module.exports = router;



