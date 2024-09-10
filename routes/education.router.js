const express = require('express');
const educationController = require('../controller/education.controller');

const router = express.Router();

// Routen für die Registrierung
router.post('/register/admin', educationController.registerAdmin);
router.post('/register/lehrbetrieb', educationController.registerLehrbetrieb);
router.post('/register/berufsbildner', educationController.registerBerufsbildner);

// Login-Routen
router.post('/login', educationController.login);

// Geschützte Routen (Token-Authentifizierung erforderlich)
router.use(educationController.authenticateToken); // Token-Authentifizierung für alle folgenden Routen

// Lernende
router.get('/lernende', educationController.getLernendeMitFaecher);
router.post('/lernende', educationController.addLernender);

// Fächer
router.post('/lernende/:lernenderId/faecher', educationController.addFach);

// Noten
router.post('/lernende/:lernenderId/faecher/:fachId/noten', educationController.addNote);

module.exports = router;
