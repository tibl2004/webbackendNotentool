// fach.entity.js
class Fach {
    constructor(id, name) {
      this.id = id;
      this.name = name;
      this.pruefungen = [];
    }
  
    addPruefung(pruefung) {
      this.pruefungen.push(pruefung);
    }
  
    removePruefung(pruefungId) {
      this.pruefungen = this.pruefungen.filter(pruefung => pruefung.id !== pruefungId);
    }
  }
  
  module.exports = { Fach };
  