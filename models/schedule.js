const { firestore } = require('./db');

class GameSchedule {
  constructor(date, month, day, registered, time, gridSize, sponsorship = "Free") {
    this.date = date;
    this.month = month;
    this.day = day;
    this.registered = registered || 0;
    this.time = time;
    this.gridSize = gridSize || 5;
    this.sponsorship = sponsorship;
  }

  async save() {
    try {
      if (!this.date || !this.month || !this.day) {
        throw new Error('Date, month and day are required');
      }
      const scheduleObject = this.toJSON();
      await firestore.collection('gameSchedules').doc(`${this.date}-${this.month}-${this.day}`).set(scheduleObject);
    } catch (error) {
      console.error(error);
    }
  }

  static async findOne() {
    try {
      const doc = await firestore.collection('gameSchedules').limit(1).get();
      if (!doc.empty) {
        return new GameSchedule(
          doc.docs[0].data().date,
          doc.docs[0].data().month,
          doc.docs[0].data().day,
          doc.docs[0].data().registered,
          doc.docs[0].data().time,
          doc.docs[0].data().gridSize,
          doc.docs[0].data().sponsorship
        );
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      throw new Error('Error finding schedule');
    }
  }

  toJSON() {
    return {
      date: this.date,
      month: this.month,
      day: this.day,
      registered: this.registered,
      time: this.time,
      gridSize: this.gridSize,
      sponsorship: this.sponsorship,
    };
  }
}

module.exports = GameSchedule;