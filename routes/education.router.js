const express = require('express');
const router = express.Router();
const { educationController, authenticateToken } = require('../controller/educationController');

// Lehrbetrieb Registrierung und Login
router.post('/register', educationController.register);
router.post('/login', educationController.login);

// Geschützte Route für Lernende (nur für eingeloggte Lehrbetriebe)
router.get('/lernende', authenticateToken, educationController.getLernende);

// Weitere Routen
router.post('/lehrbetrieb/:lehrbetriebId/lernender', authenticateToken, educationController.addLernender);
router.post('/lernender/:lernenderId/fach', authenticateToken, educationController.addFach);
router.post('/fach/:fachId/note', authenticateToken, educationController.addNote);

module.exports = router;
