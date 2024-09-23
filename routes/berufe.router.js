const express = require('express');
const berufeController = require('../controller/berufe.controller'); // Importiere den Berufe-Controller

const router = express.Router();

// Middleware zur Authentifizierung
router.use(berufeController.authenticateToken);

// Alle Berufe abrufen
router.get('/', berufeController.getBerufe);

// Beruf nach ID abrufen
router.get('/:id', berufeController.getBerufById);

// Beruf hinzufügen
router.post('/', berufeController.addBeruf);

// Beruf aktualisieren
router.put('/:id', berufeController.updateBeruf);

// Beruf löschen
router.delete('/:id', berufeController.deleteBeruf);

module.exports = router;
