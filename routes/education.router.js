const express = require('express');
const educationController = require('../controller/education.controller'); // Pfad anpassen

const router = express.Router();

// Admin-Registrierung
router.post('/register/admin', educationController.registerAdmin);

// Lehrbetrieb-Registrierung
router.post('/register/lehrbetrieb', educationController.registerLehrbetrieb);

// Berufsbildner-Registrierung
router.post('/register/berufsbildner', educationController.registerBerufsbildner);

// Lernenden-Registrierung (mit Authentifizierung)
router.post('/register/lernender', educationController.authenticateToken, educationController.registerLernender);

// Login für Admin, Berufsbildner, Lernende und Lehrbetrieb
router.post('/login', educationController.login);

router.get('/lehrbetriebe', educationController.getLehrbetriebe);

// Lernende mit Fächern abrufen (mit Authentifizierung)
router.get('/lernende', educationController.authenticateToken, educationController.getLernendeMitFaecher);

// Lernenden aktualisieren (mit Authentifizierung)
router.put('/lernender/:lernenderId', educationController.authenticateToken, educationController.updateLernender);

// Fach hinzufügen (mit Authentifizierung) und lernenderId in der URL
router.post('/lernender/:lernenderId/fach', educationController.authenticateToken, educationController.addFach);

// Fach aktualisieren (mit Authentifizierung) und lernenderId in der URL
router.put('/lernender/:lernenderId/fach/:fachId', educationController.authenticateToken, educationController.updateFach);

// Fach abrufen (mit Authentifizierung) und lernenderId in der URL
router.get('/lernender/:lernenderId/faecher', educationController.authenticateToken, educationController.getLernendeMitFaecher);

// Note hinzufügen (mit Authentifizierung) und lernenderId in der URL
router.post('/lernender/:lernenderId/fach/:fachId/note', educationController.authenticateToken, educationController.addNote);

// Note aktualisieren (mit Authentifizierung) und lernenderId in der URL
router.put('/lernender/:lernenderId/fach/:fachId/note', educationController.authenticateToken, educationController.updateNote);

// Note löschen (mit Authentifizierung) und lernenderId in der URL
router.delete('/lernender/:lernenderId/fach/:fachId/note', educationController.authenticateToken, educationController.deleteNote);

module.exports = router;
