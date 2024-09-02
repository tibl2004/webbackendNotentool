const express = require('express');
const { educationController, authenticateToken } = require('../controller/education.controller');

const router = express.Router();

// Route für das Registrieren eines Lehrbetriebs
router.post('/register-lehrbetrieb', educationController.registerLehrbetrieb);

// Route für das Registrieren eines Berufsbildners
router.post('/register-berufsbildner', authenticateToken, educationController.registerBerufsbildner);

// Route für das Login eines Berufsbildners
router.post('/login-berufsbildner', educationController.loginBerufsbildner);

// Route für das Abrufen aller Lehrbetriebe
router.get('/lehrbetriebe', authenticateToken, educationController.getAllLehrbetriebe);

// Route für das Abrufen aller Lernenden des Berufsbildners
router.get('/lernende', authenticateToken, educationController.getLernende);

// Route für das Hinzufügen eines Lernenden
router.post('/lernende', authenticateToken, educationController.addLernender);

// Route für das Hinzufügen eines Fachs zu einem Lernenden
router.post('/fach/:lernenderId', authenticateToken, educationController.addFach);

// Route für das Hinzufügen einer Note zu einem Fach
router.post('/note/:fachId', authenticateToken, educationController.addNote);

// Route für das Abrufen aller Fächer eines Lernenden
router.get('/faecher/:lernenderId', authenticateToken, educationController.getFaecher);

// Route für das Abrufen aller Noten eines Fachs
router.get('/noten/:fachId', authenticateToken, educationController.getNoten);

module.exports = router;
