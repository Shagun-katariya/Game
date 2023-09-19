const { firestore } = require('./db');

class User {
  constructor(mobileNumber, booleanVariable, imageUrl, username, birthday, grid, status) {
    if (!User.isValidMobileNumber(mobileNumber)) {
      throw new Error('Mobile number must be exactly 10 digits');
    }
    this.mobileNumber = mobileNumber;
    this.booleanVariable = booleanVariable || false;
    this.imageUrl = imageUrl;
    this.username = username;
    this.birthday = birthday;
    this.grid = grid || [];
    this.status = status || 'loser';
  }

  async save() {
    try {
      if (!this.mobileNumber) {
        throw new Error('Mobile number is required');
      }

      const userObject = this.toJSON();

      await firestore.collection('users').doc(this.mobileNumber).set(userObject);
    } catch (error) {
      console.error(error);
    }
  }

  // Add a static method to validate mobile number
  static isValidMobileNumber(mobileNumber) {
    const mobileNumberRegex = /^\d{10}$/;
    return mobileNumberRegex.test(mobileNumber);
  }

  static async find() {
    try {
      const snapshot = await firestore.collection('users').get();
      const users = [];

      snapshot.forEach((doc) => {
        const userData = doc.data();
        const user = new User(
          userData.mobileNumber,
          userData.booleanVariable,
          userData.imageUrl,
          userData.username,
          userData.birthday,
          userData.grid,
          userData.status
        );
        users.push(user);
      });

      return users;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching users');
    }
  }


  static async findOne(mobileNumber) {
    try {
      const doc = await firestore.collection('users').doc(mobileNumber).get();
      if (doc.exists) {
        return new User(
          doc.data().mobileNumber,
          doc.data().booleanVariable,
          doc.data().imageUrl,
          doc.data().username,
          doc.data().birthday,
          doc.data().grid,
          doc.data().status
        );
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      throw new Error('Error finding user');
    }
  }

  async winGame() {
    try {
      if (!this.mobileNumber) {
        throw new Error('Mobile number is required');
      }
      this.status = "winner";
      const userObject = this.toJSON();
      delete userObject.mobileNumber;
      await firestore.collection('users').doc(this.mobileNumber).update(userObject);
    } catch (error) {
      console.error(error);
    }
  }


  toJSON() {
    return {
      mobileNumber: this.mobileNumber,
      booleanVariable: this.booleanVariable,
      imageUrl: this.imageUrl,
      username: this.username,
      birthday: this.birthday,
      grid: this.grid,
      status: this.status,
    };
  }
}

module.exports = User;


