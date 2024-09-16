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

// Route für Lehrbetriebe, nur für Admins
router.get('/lehrbetriebe', educationController.authenticateToken, educationController.getLehrbetriebe);

// Lernende mit Fächern abrufen (mit Authentifizierung)
router.get('/lernende', educationController.authenticateToken, educationController.getLernende);

// Lernenden aktualisieren (mit Authentifizierung)
router.put('/lernender/:lernenderId', educationController.authenticateToken, educationController.updateLernender);

// Fach hinzufügen (mit Authentifizierung) und lernenderId in der URL
router.post('/lernende/:lernenderId/fach', educationController.authenticateToken, educationController.addFach);

// Fach aktualisieren (mit Authentifizierung) und lernenderId in der URL
router.put('/lernender/:lernenderId/fach/:fachId', educationController.authenticateToken, educationController.updateFach);

// Fach abrufen (mit Authentifizierung) und lernenderId in der URL
router.get('/lernender/:lernenderId/faecher', educationController.authenticateToken, educationController.getLernendeMitFaecher);

// Note hinzufügen (mit Authentifizierung) und lernenderId in der URL
router.post('/lernende/:lernenderId/fach/:fachId/noten', educationController.authenticateToken, educationController.addNote);

// Note aktualisieren (mit Authentifizierung) und lernenderId in der URL
router.put('/lernender/:lernenderId/fach/:fachId/note', educationController.authenticateToken, educationController.updateNote);

// Endpunkt zum Abrufen der Fächer eines Lernenden (ohne Noten)
router.get('/lernende/:lernenderId/faecher', educationController.getFaecherFuerLernender);

// Note löschen (mit Authentifizierung) und lernenderId in der URL
router.delete('/lernender/:lernenderId/fach/:fachId/note', educationController.authenticateToken, educationController.deleteNote);

// Route zum Abrufen eines Lernenden anhand der ID
router.get('/lernende/:id', educationController.getLernenderById);

// Route zum Abrufen der Noten für ein bestimmtes Fach eines Lernenden
router.get('/lernende/:lernenderId/fach/:fachId/noten', educationController.authenticateToken, educationController.getNotenFuerFach);

module.exports = router;



module.exports = router;
