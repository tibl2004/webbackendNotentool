const express = require('express');
const router = express.Router();
const berufsbildnerController = require('../controller/berufsbildner.controller');

// Authentifizierung und Rollenüberprüfung für alle Routen anwenden
router.use(berufsbildnerController.authenticateToken);
router.use(berufsbildnerController.checkIfBerufsbildner);

// Lernende abrufen, die diesem Berufsbildner zugeordnet sind
router.get('/lernende', berufsbildnerController.getLernende);

// Fächer und Notendurchschnitt für einen bestimmten Lernenden abrufen
router.get('/lernende/:lernenderId/faecher', berufsbildnerController.getFaecherUndNotendurchschnitte);

// Noten für ein bestimmtes Fach eines Lernenden abrufen
router.get('/lernende/:lernenderId/faecher/:fachId/noten', berufsbildnerController.getNotenForFach);

// Lernenden aktualisieren
router.put('/lernende/:lernenderId', berufsbildnerController.updateLernender);

// Lernenden löschen
router.delete('/lernende/:id', berufsbildnerController.deleteLernender);

module.exports = router;
