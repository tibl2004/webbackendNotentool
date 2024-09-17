const express = require('express');
const educationController = require('../controller/education.controller'); // Pfad anpassen

const router = express.Router();

// Registrierungen
router.post('/register/admin', educationController.registerAdmin);
router.post('/register/lehrbetrieb', educationController.registerLehrbetrieb);
router.post('/register/berufsbildner', educationController.registerBerufsbildner);
router.post('/register/lernender', educationController.authenticateToken, educationController.registerLernender);

// Login für Admin, Berufsbildner, Lernende und Lehrbetrieb
router.post('/login', educationController.login);

// Lehrbetriebe und Lernende
router.get('/lehrbetriebe', educationController.authenticateToken, educationController.getLehrbetriebe);
router.get('/lernende', educationController.authenticateToken, educationController.getLernende);

// Routen zu Lernenden mit Noten in den Fächern
router.get('/lernende/:lernenderId/fach/:fachId/noten', educationController.authenticateToken, educationController.getNotenByLernenderAndFach);
router.post('/lernende/:lernenderId/fach/:fachId/noten', educationController.authenticateToken, educationController.addNote);
router.put('/lernende/:lernenderId/fach/:fachId/noten/:noteId', educationController.authenticateToken, educationController.updateNote); // Die Funktion anpassen
router.delete('/lernende/:lernenderId/fach/:fachId/noten/:noteId', educationController.authenticateToken, educationController.deleteNote);

// Lernenden aktualisieren (mit Authentifizierung)
router.put('/lernende/:lernenderId', educationController.authenticateToken, educationController.updateLernender);

// Fach hinzufügen (mit Authentifizierung) und lernenderId in der URL
router.post('/lernende/:lernenderId/fach', educationController.authenticateToken, educationController.addFach);

// Fach aktualisieren (mit Authentifizierung) und fachId in der URL
router.put('/lernende/:lernenderId/fach/:fachId', educationController.authenticateToken, educationController.updateFach);

// Endpunkt zum Abrufen der Fächer eines Lernenden (ohne Noten)
router.get('/lernende/:lernenderId/faecher', educationController.authenticateToken, educationController.getLernendeMitFaecher);

// Route zum Abrufen eines Lernenden anhand der ID
router.get('/lernende/:id', educationController.authenticateToken, educationController.getLernenderById);

module.exports = router;
