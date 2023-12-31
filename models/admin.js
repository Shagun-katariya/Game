const { firestore } = require('./db');

class Admin {
  constructor(mobileNumber, usedNumbers) {
    this.mobileNumber = mobileNumber;
    this.usedNumbers = usedNumbers || []; 
  }

  async save() {
    try {
      if (!this.mobileNumber) {
        throw new Error('Mobile number is required');
      }

      const adminObject = this.toJSON(); 

      await firestore.collection('admins').doc(this.mobileNumber).set(adminObject);
    } catch (error) {
      console.error(error);
    }
  }

  static async findOne(mobileNumber) {
    try {
      const doc = await firestore.collection('admins').doc(mobileNumber).get();
      if (doc.exists) {
        return new Admin(
          doc.data().mobileNumber,
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
      usedNumbers: this.usedNumbers,
    };
  }
}

module.exports = Admin;
