const express = require('express');
const router = express.Router();
const fachController = require('../controller/fach.controller');

// Middleware zur Authentifizierung
router.use(fachController.authenticateToken);

// Route: Fächer eines bestimmten Lernenden abrufen
router.get('/lernender/:lernenderId/faecher', fachController.getFaecher);

// Route: Neues Fach hinzufügen (nur für Lehrbetrieb oder Berufsbildner)
router.post('/', fachController.addFach);

// Route: Bestehendes Fach aktualisieren
router.put('/:fachId', fachController.updateFach);

// Route: Fach löschen
router.delete('/:fachId', fachController.deleteFach);

module.exports = router;
