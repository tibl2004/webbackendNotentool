const express = require('express');
const registerController = require('../controller/register.controller'); // Ersetze dies mit dem tatsächlichen Pfad

const router = express.Router();

// Admin-Registrierung
router.post('/admin', registerController.registerAdmin);

// Lehrbetrieb-Registrierung
router.post('/lehrbetrieb', registerController.registerLehrbetrieb);

// Berufsbildner-Registrierung
router.post('/berufsbildner', registerController.registerBerufsbildner);

// Lernende registrieren (nur für Lehrbetriebe)
router.post('/lernender', registerController.authenticateToken, registerController.registerLernender);

// Lizenz aktivieren (nur für Lehrbetriebe)
router.post('/activate-license', registerController.activateLicense);

module.exports = router;
