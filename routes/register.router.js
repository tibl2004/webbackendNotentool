const express = require('express');
const router = express.Router();
const registerController = require('../controller/register.controller');

// Admin-Registrierung
router.post('/admin', registerController.registerAdmin);

// Lehrbetrieb-Registrierung
router.post('/lehrbetrieb',  registerController.authenticateToken, registerController.registerLehrbetrieb);

// Berufsbildner-Registrierung
router.post('/berufsbildner',  registerController.authenticateToken, registerController.registerBerufsbildner);

// Lernende-Registrierung (nur für Lehrbetrieb)
router.post('/lernender', registerController.authenticateToken, registerController.registerLernender);

module.exports = router;
