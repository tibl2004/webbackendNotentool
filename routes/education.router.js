const express = require('express');
const { educationController, authenticateToken } = require('../controller/education.controller');

const router = express.Router();

// Route für das Abrufen aller Lehrbetriebe
router.get('/lehrbetriebe', authenticateToken, educationController.getAllLehrbetriebe);

// Route für das Registrieren des Lehrbetriebs
router.post('/register', educationController.registerLehrbetrieb);

// Route für das Login des Berufsbildners
router.post('/login', educationController.loginBerufsbildner);

// Route für das Abrufen aller Lernenden des Berufsbildners
router.get('/lernende', authenticateToken, educationController.getLernende);

// Route für das Abrufen aller Fächer eines Lernenden
router.get('/lernende/:lernenderId/faecher', authenticateToken, educationController.getFaecherByLernenderId);

// Route für das Abrufen aller Noten eines Faches
router.get('/faecher/:fachId/noten', authenticateToken, educationController.getNotenByFachId);

// Route für das Hinzufügen eines Lernenden
router.post('/lernende', authenticateToken, educationController.addLernender);

// Route für das Hinzufügen eines Fachs zu einem Lernenden
router.post('/faecher/:lernenderId', authenticateToken, educationController.addFach);

// Route für das Hinzufügen einer Note zu einem Fach
router.post('/noten/:fachId', authenticateToken, educationController.addNote);

module.exports = router;
