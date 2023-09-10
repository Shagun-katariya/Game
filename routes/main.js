const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });
const User = require('../dal/models/user.js')
const schedule = require('../dal/models/schedule.js')
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

let number; 

router.post('/login', (req, res) => {
  const { mobileNumber } = req.body;
  number = mobileNumber;

  // Generate OTP
  let otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Send OTP using Twilio
  client.messages.create({
    body: `Your OTP is: ${otp}`,
    to: mobileNumber,  // Replace with your phone number
    from: twilioConfig.phoneNumber // Replace with your Twilio number
  })
    .then((message) => {
      console.log(message.sid);
      res.render('match-otp', { OTP: otp, });
      //check OTP verification in frontend
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send({ status: 'error', message: error.message });
    });
});

router.post('/resendOTP', (req, res) => {
  let otp = Math.floor(100000 + Math.random() * 900000).toString();
  client.messages.create({
    body: `Your OTP is: ${otp}`,
    to: number,  
    from: twilioConfig.phoneNumber 
  })
    .then((message) => {
      console.log(message.sid);
      res.render('match-otp', { OTP: otp, });
      //check OTP verification in frontend
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send({ status: 'error', message: error.message });
    });
});



router.get('/logout', (req, res) => {
  try {
    req.logout();
    res.redirect('/login');
  } catch (err) {
    res.status(400).send({ message: 'Failed to logout user' });
  }
});


router.get('/profile/:mobileNumber', async (req, res) => {
  const { mobileNumber } = req.params;

  try {
    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Render a page with user details
    res.render('profile', { user });
    //use user to show the details in frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/profile', async (req, res) => {
  const { mobileNumber, imageUrl, username, birthday } = req.body;

  try {
    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate the user's age based on their birthday
    const age = new Date().getFullYear() - new Date(birthday).getFullYear();

    // Check if the user is less than 18 years old
    if (age < 18) {
      // Redirect to another API
      return res.redirect('/less-age');
    }

    user.imageUrl = imageUrl;
    user.username = username;
    user.birthday = birthday;

    await user.save();
    res.redirect('/profile/:mobileNumber');

    res.json({ message: 'Profile updated successfully', user });
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




// Generate a random m*m grid of unique numbers within a specified range
function generateRandomGrid(m, min = 1, max = 99) {
  const numbers = [];

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
      row.push(numbers[index]);
      index++;
    }
    grid.push(row);
  }

  return grid;
}


router.post('/register', async (req, res) => {
  try {
    const Schedule = await schedule.findOne({});
    if (Schedule.registered <= 5000) {
      const user = await User.findOne({ mobileNumber: req.body.mobileNumber });
      if (user) {
        user.booleanVariable = true;
        user.grid = generateRandomGrid(Schedule.gridSize);
        await user.save();
        Schedule.registered++;
        await Schedule.save();
        res.status(200).json({ message: 'Registration successful' });
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

// Admin API endpoint to update the grid size, date and time
app.put('/admin/update', async (req, res) => {
  try {
    const { date, month, day, time, gridSize } = req.body;
    // Update the values in your database
    await schedule.updateOne({}, { date, month, day, time, gridSize });
    if (gridSize) {
      // If only gridSize is changed
      await User.updateMany(
        { booleanVariable: true },
        { $set: { grid:  generateRandomGrid(schedule.gridSize)} }
      );
    } else {
      // If any other value is updated
      await User.updateMany({}, { $set: { booleanVariable: false } });
      //redirect
    }
    res.send('Values updated successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/enter-the-game', async (req, res) => {
  try {
    const { mobileNumber } = req.query;
    // Find the user document associated with the mobile number
    const user = await User.findOne({ mobileNumber: mobileNumber });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('enter-the-game', {user:user, });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


//generate a number 
router.get('/randomNumbers', (req, res) => {
  let numbers = [];
  for(let i = 0; i < 99; i++) {
      numbers.push(Math.floor(Math.random() * 99) + 1);
  }
  res.render('randomNumbers', {Numbers:numbers,});
});

module.exports = router;
