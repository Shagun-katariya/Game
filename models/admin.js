const db = require('./db');

class Admin {
  constructor(mobileNumber, gameStatus) {
    this.mobileNumber = mobileNumber;
    this.gameStatus = gameStatus || 'ongoing'; // 'ongoing', 'stopped'
    this.usedNumbers = []; 
  }

  async save() {
    try {
      if (!this.mobileNumber) {
        throw new Error('Mobile number is required');
      }

      const adminObject = this.toJSON(); 

      await db.collection('admins').doc(this.mobileNumber).set(adminObject);
    } catch (error) {
      console.error(error);
    }
  }

  static async findOne(mobileNumber) {
    try {
      const doc = await db.collection('admins').doc(mobileNumber).get();
      if (doc.exists) {
        return new Admin(
          doc.data().mobileNumber,
          doc.data().gameStatus,
          doc.data().usedNumbers,
        );
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      throw new Error('Error finding admin');
    }
  }

  async stopGame() {
    try {
      if (!this.mobileNumber) {
        throw new Error('Mobile number is required');
      }
      this.gameStatus = 'stopped';
      const gameObject = this.toJSON();
      delete gameObject.mobileNumber;
      await db.collection('admins').doc(this.mobileNumber).update(gameObject);
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

  toJSON() {
    return {
      mobileNumber: this.mobileNumber,
      gameStatus: this.gameStatus,
      usedNumbers: this.usedNumbers,
    };
  }
}

module.exports = Admin;
