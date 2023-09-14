const db = require('./db');

class Admin {
  constructor(mobileNumber, gameStatus) {
    this.mobileNumber = mobileNumber;
    this.gameStatus = gameStatus || 'ongoing'; // 'ongoing', 'stopped'
    this.usedNumbers = []; // Array to store used numbers
  }

  async save() {
    try {
      if (!this.mobileNumber) {
        throw new Error('Mobile number is required');
      }
      await db.collection('admins').doc(this.mobileNumber).set(this);
    } catch (error) {
      console.error(error);
    }
  }

  static async findOne(mobileNumber) {
    try {
      const doc = await db.collection('admins').doc(mobileNumber).get();
      return doc.exists ? new Admin(doc.data()) : null;
    } catch (error) {
      console.error(error);
    }
  }

  async stopGame() {
    try {
      if (!this.mobileNumber) {
        throw new Error('Mobile number is required');
      }
      this.gameStatus = 'stopped';
      await db.collection('game').doc('status').set({ gameStopped: true });
    } catch (error) {
      console.error(error);
    }
  }

  generateUniqueRandomNumber() {
    const maxNumber = 99;
    let randomNum;

    do {
      randomNum = Math.floor(Math.random() * maxNumber) + 1;
    } while (this.usedNumbers.includes(randomNum));

    this.usedNumbers.push(randomNum);

    return randomNum;
  }
}

module.exports = Admin;
