// pruefung.entity.js
class Pruefung {
  constructor(id, name, note, datum, fach) {
    this.id = id;
    this.name = name;
    this.note = note;
    this.datum = datum;
    this.fach = fach;
  }
}

module.exports = { Pruefung };
