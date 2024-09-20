const express = require('express');
const router = express.Router();
const berufsbildnerController = require('../controller/berufsbildner.controller');

// Middleware zur Authentifizierung und Berechtigungsprüfung
router.use(berufsbildnerController.authenticateToken);
router.use(berufsbildnerController.checkIfBerufsbildner);

// Route zum Abrufen der Noten eines Lernenden für ein spezifisches Fach
router.get('/lernende/:lernenderId/fach/:fachId/marks', berufsbildnerController.getMarksForLernenderAndFach);

// Route zum Abrufen der Fächer eines bestimmten Lernenden
router.get('/lernende/:lernenderId/faecher', berufsbildnerController.getFaecherForLernender);

module.exports = router;
