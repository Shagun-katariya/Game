const express = require('express');
const router = express.Router();
// const dotenv = require('dotenv');
// const path = require('path');
// const envPath = path.join(__dirname, '..', '.env');
// dotenv.config({ path: envPath });
const User = require('../models/user.js');
const schedule = require('../models/schedule.js');
const admin = require('../models/admin.js');
const twilio = require('twilio');
const twilioConfig = require('../twilio.js');
const { realtimeDb } = require('../models/db.js');


router.get('/', async (req, res) => {
  res.status(200).json({ message: 'splash screen' });
})

router.get('/languages', async (req, res) => {
  res.status(200).json({ message: 'languages screen' });
})


router.get('/less-age', (req, res) => {
  res.status(200).json({ message: 'less-age screen' });
})

router.get('/rewards', (req, res) => {
  res.status(200).json({ message: 'rewards screen' });
})


//for Main menu screen
router.get('/main-menu', async (req, res) => {
  res.status(200).json({ message: 'main-menu' });
})

//for Main help button
router.get('/help', async (req, res) => {
  res.status(200).json({ message: 'help' });
})

//for Main setting 
router.get('/setting', async (req, res) => {
  res.status(200).json({ message: 'setting' });
})


//for login using mobile number
router.get('/userlogin', async (req, res) => {
  res.status(200).json({ message: 'user login page' });
})

//for login using mobile number
router.get('/usersignup', async (req, res) => {
  res.status(200).json({ message: 'user signup' });
})

//for login using mobile number
router.get('/adminlogin', async (req, res) => {
  res.status(200).json({ message: 'admin login page' });
})

router.get('/home', async (req, res) => {
  const Schedule = await schedule.findOne({});
  if (!Schedule) {
    return res.status(404).json({ message: 'Schedule not found' });
  }

  return res.status(200).json({ Schedule });
})

const client = twilio(twilioConfig.accountSid, twilioConfig.authToken);


router.post('/usersignup', async (req, res) => {
  const { mobileNumber } = req.body;
  req.session.mobileNumber = mobileNumber;


  if (!mobileNumber) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  const existingUser = await User.findOne(mobileNumber);

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
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
      res.status(200).send({ message: "otp sent" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send({ status: 'error', message: error.message });
    });
});

router.post('/usersignup/verify-otp', async (req, res) => {
  const { otp } = req.body;
  if (req.session.otp == otp) {
    const mobileNumber = req.session.mobileNumber;
    req.session.otp = null;
    const user = new User(
      mobileNumber,
      false,
      '',
      '',
      '',
      [],
      'loser'
    );
    try {
      await user.save();
      res.status(200).send({ message: "User signup successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: 'error', message: error.message });
    }
  } else {
    res.status(400).send({ status: 'error', message: 'Invalid OTP' });
  }
});



router.post('/userlogin', async (req, res) => {
  const { mobileNumber } = req.body;
  req.session.mobileNumber = mobileNumber;


  if (!mobileNumber) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  const existingUser = await User.findOne(mobileNumber);

  if (!existingUser) {
    return res.status(400).json({ message: 'User not exists' });
  }


  let otp = Math.floor(100000 + Math.random() * 900000).toString();
  req.session.otp = otp;
  console.log(otp);
  client.messages.create({
    body: `Your OTP is: ${otp}`,
    to: req.session.mobileNumber,
    from: twilioConfig.phoneNumber
  })
    .then((message) => {
      console.log(message.sid);
      res.status(200).send({ message: "otp sent" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send({ status: 'error', message: error.message });
    });
});

router.post('/userlogin/verify-otp', async (req, res) => {
  const { otp } = req.body;

  if (req.session.otp === otp) {
    req.session.otp = null;
    try {
      res.status(200).send({ message: "User login successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: 'error', message: error.message });
    }
  } else {
    res.status(400).send({ status: 'error', message: 'Invalid OTP' });
  }
});

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
      res.status(200).send({ message: "Otp sent" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send({ status: 'error', message: error.message });
    });
});

router.post('/languages', async (req, res) => {
  const { language } = req.body;
  const mobileNumber = req.session.mobileNumber;

  try {
    const user = await User.findOne(mobileNumber);
    user.language = language;
    await user.save();
    res.status(200).json({ message: "language updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
  
})



router.post('/admin-login', async (req, res) => {
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
      to: req.session.mobileNumber,
      from: twilioConfig.phoneNumber
    })
      .then((message) => {
        console.log(message.sid);
        res.status(200).send({ message: "otp sent" });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: error.message });
      });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/adminlogin/verify-otp', async (req, res) => {
  const { otp } = req.body;

  if (req.session.otp == otp) {
    req.session.otp = null;
    try {
      res.status(200).send({ message: "Admin login successfully" });
    } catch (error) {
      res.status(500).send({ status: 'error', message: error.message });
    }
  } else {
    res.status(400).send({ status: 'error', message: 'Invalid OTP' });
  }
});



router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.status(200).send({ message: "Logout successfully" });
  });
});



router.get('/profile', async (req, res) => {
  const mobileNumber = req.session.mobileNumber;

  try {
    const user = await User.findOne(mobileNumber);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});


router.put('/profile-update', async (req, res) => {
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
    res.status(200).json({ message: "profile updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});



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
    for (let j = 0; j < m; j++) {
      if (i === Math.floor(m / 2) && j === Math.floor(m / 2)) {
        grid.push(Schedule.sponsorship);
      } else {
        grid.push(numbers[index]);
        index++;
      }
    }
  }

  return grid;
}


router.post('/register', async (req, res) => {
  try {
    const Schedule = await schedule.findOne({});
    if (Schedule.registered <= 5000) {
      const user = await User.findOne(req.session.mobileNumber);
      if (user) {
        if (user.booleanVariable == true) {
          return res.status(404).json({ message: 'User already registered' });
        }
        user.booleanVariable = true;
        user.grid = await generateRandomGrid(Schedule.gridSize);
        await user.save();
        Schedule.registered++;
        await Schedule.save();
        res.status(200).json({ message: "succesfully register" });
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

router.get('/enter-the-game', async (req, res) => {
  const mobileNumber = req.session.mobileNumber;
  const user = await User.findOne(mobileNumber);
  try {
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


router.post('/winner', async (req, res) => {
  try {
    const user = await User.findOne(req.session.mobileNumber);
    if (user) {
      await user.winGame();
      res.status(200).send('User has won the game');
    } else {
      res.status(404).send('User not found.');
    }
  } catch (error) {
    res.status(500).send(err.message);
  }
});

router.post('/stop-game', async (req, res) => {
  try {
    const users = await User.find();
    for (const user of users) {
      user.booleanVariable = false;
      await user.save();
    }

    const realtimeGameStatusRef = realtimeDb.ref('gameStatus');
    await realtimeGameStatusRef.set('stopped');

    res.send({ message: 'Game stopped.' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});




module.exports = router;



