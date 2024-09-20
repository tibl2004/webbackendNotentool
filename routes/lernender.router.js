const express = require('express');
const router = express.Router();
const lernenderController = require('../controller/lernender.controller');

// Middleware zur Authentifizierung
router.use(lernenderController.authenticateToken);

router.get('/', lernenderController.getLernende);  // Lernenden abrufen
router.get('/:id', lernenderController.getLernenderById);  // Lernenden abrufen
router.put('/:lernenderId', lernenderController.updateLernender);  // Lernenden aktualisieren (Nur Lehrbetrieb oder Berufsbildner)
router.delete('/:id', lernenderController.deleteLernender);  // Lernenden löschen (Nur Lehrbetrieb oder Berufsbildner)

module.exports = router;
