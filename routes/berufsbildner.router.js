const express = require('express');
const router = express.Router();
const berufsbildnerController = require('../controller/berufsbildner.controller');

// Middleware zur Authentifizierung und Berechtigungsprüfung
router.use(berufsbildnerController.authenticateToken);
router.use(berufsbildnerController.checkIfBerufsbildner);

// Beispielroute zum Abrufen der Noten eines Lernenden für ein spezifisches Fach
router.get('/berufsbildner/lernende/:lernenderId/fach/:fachId/marks', authenticateToken, checkIfBerufsbildner, getMarksForLernenderAndFach);

// Route: Fächer eines bestimmten Lernenden abrufen
router.get('/lernender/:lernenderId/faecher', berufsbildnerController.getFaecherForLernender);

module.exports = router;
