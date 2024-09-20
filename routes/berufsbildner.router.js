const express = require('express');
const router = express.Router();
const berufsbildnerController = require('../controller/berufsbildner.controller');

// Middleware zur Authentifizierung und Berechtigungsprüfung
router.use(berufsbildnerController.authenticateToken);
router.use(berufsbildnerController.checkIfBerufsbildner);

// Route: Noten eines bestimmten Lernenden abrufen
router.get('/lernender/:lernenderId/marks', berufsbildnerController.getMarksForLernender);

// Route: Fächer eines bestimmten Lernenden abrufen
router.get('/lernender/:lernenderId/faecher', berufsbildnerController.getFaecherForLernender);

module.exports = router;
