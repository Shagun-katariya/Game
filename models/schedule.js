const db = require('./db');

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
      await db.collection('gameSchedules').doc(`${this.date}-${this.month}-${this.day}`).set(this);
    } catch (error) {
      console.error(error);
    }
  }

  static async findOne() {
    try {
      const doc = await db.collection('gameSchedules').limit(1).get();
      if (!doc.empty) {
        return new GameSchedule(doc.docs[0].data());
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = GameSchedule;