const db = require('./db');

class User {
  constructor(mobileNumber, booleanVariable, imageUrl, username, birthday, grid, status) {
    this.mobileNumber = mobileNumber;
    this.booleanVariable = booleanVariable || false;
    this.imageUrl = imageUrl;
    this.username = username;
    this.birthday = birthday;
    this.grid = grid || [[]];
    this.status = status || 'loser'; 
  }

  async save() {
    try {
      if (!this.mobileNumber) {
        throw new Error('Mobile number is required');
      }
      await db.collection('users').doc(this.mobileNumber).set(this);
    } catch (error) {
      console.error(error);
    }
  }

  static async findOne(mobileNumber) {
    try {
      const doc = await db.collection('users').doc(mobileNumber).get();
      return doc.exists ? new User(doc.data()) : null;
    } catch (error) {
      console.error(error);
    }
  }

  async winGame() {
    try {
      if (!this.mobileNumber) {
        throw new Error('Mobile number is required');
      }
      this.status = "winner";
      await db.collection('users').doc(this.mobileNumber).update(this);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = User;


