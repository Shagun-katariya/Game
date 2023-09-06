const User = require('./models/user');

const googleAuthDal = {
  registerWithGoogle: async (oauthUser) => {
    try {
      const isUserExists = await User.findOne({
        googleId: oauthUser.id,
      });

      if (isUserExists) {
        const failure = {
          message: 'User already Registered.',
        };
        return { failure };
      }

      const user = new User({
        googleId: oauthUser.id, 
        name: oauthUser.displayName,
        provider: 'google', 
        email: oauthUser.emails[0].value,
      });
      await user.save();
      const success = {
        message: 'User Registered.',
      };
      return { success };
    } catch (error) {
      console.error(error);
      return { error };
    }
  },
};

module.exports = googleAuthDal;

