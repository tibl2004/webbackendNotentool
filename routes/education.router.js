const express = require('express');
const { educationController, authenticateToken } = require('../controller/education.controller');

const router = express.Router();

// Lehrbetrieb registrieren
router.post('/register-lehrbetrieb', educationController.registerLehrbetrieb);

// Lehrbetrieb Login
router.post('/login-lehrbetrieb', educationController.loginLehrbetrieb);

// Berufsbildner registrieren (mit Authentifizierung)
router.post('/register-berufsbildner', authenticateToken, educationController.registerBerufsbildner);

// Berufsbildner Login
router.post('/login-berufsbildner', educationController.loginBerufsbildner);

// Lernende verwalten (mit Authentifizierung)
router.get('/lernende', authenticateToken, educationController.getLernende);
router.post('/lernende', authenticateToken, educationController.addLernender);

// Fächer verwalten (mit Authentifizierung)
router.post('/fach/:lernenderId', authenticateToken, educationController.addFach);
router.get('/faecher/:lernenderId', authenticateToken, educationController.getFaecher);

// Noten verwalten (mit Authentifizierung)
router.post('/note/:fachId', authenticateToken, educationController.addNote);
router.get('/noten/:fachId', authenticateToken, educationController.getNoten);

// Alle Lehrbetriebe abrufen (keine Authentifizierung erforderlich)
router.get('/lehrbetriebe', educationController.getAllLehrbetriebe);

module.exports = router;
