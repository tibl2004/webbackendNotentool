const express = require('express');
const router = express.Router();
const lehrbetriebController = require('../controller/lehrbetrieb.controller');

// Middleware zum Authentifizieren des Tokens
router.use(lehrbetriebController.authenticateToken);

// Routen
router.get('/', lehrbetriebController.getLehrbetriebe); // Lehrbetriebe abrufen

router.put('/:id', lehrbetriebController.updateLehrbetrieb); // Lehrbetrieb aktualisieren

router.delete('/:id', lehrbetriebController.deleteLehrbetrieb); // Lehrbetrieb löschen

module.exports = router;
