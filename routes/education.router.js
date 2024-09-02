const express = require('express');
const { educationController, authenticateToken } = require('../controller/education.controller');

const router = express.Router();

// Route für das Erstellen eines Berufsbildners
router.post('/berufsbildner/register', educationController.registerBerufsbildner);

// Route für das Login eines Berufsbildners
router.post('/berufsbildner/login', educationController.loginBerufsbildner);

// Route für das Abrufen aller Lernenden eines Berufsbildners
router.get('/lernende', authenticateToken, educationController.getLernende);

// Route für das Hinzufügen eines Lernenden
router.post('/lernende', authenticateToken, educationController.addLernender);

// Route für das Abrufen der Fächer eines Lernenden
router.get('/fächer/:lernenderId', authenticateToken, educationController.getFächer);

// Route für das Hinzufügen einer Note zu einem Fach
router.post('/noten/:fachId', authenticateToken, educationController.addNote);

module.exports = router;
