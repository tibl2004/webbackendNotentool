const express = require('express');
const homeworkController = require('../controller/homework.controller'); // Pfad anpassen

const router = express.Router();

// Hausaufgabe hinzufügen (mit Authentifizierung)
router.post('/homework', homeworkController.authenticateToken, homeworkController.addHomework);

// Alle Hausaufgaben eines Lernenden abrufen (mit Authentifizierung)
router.get('/homework/lernender/:lernenderId', homeworkController.authenticateToken, homeworkController.getHomeworkForLernender);

// Hausaufgabe anhand der ID abrufen (mit Authentifizierung)
router.get('/homework/:homeworkId', homeworkController.authenticateToken, homeworkController.getHomeworkById);

// Hausaufgabe aktualisieren (mit Authentifizierung)
router.put('/homework/:homeworkId', homeworkController.authenticateToken, homeworkController.updateHomework);

// Hausaufgabe löschen (mit Authentifizierung)
router.delete('/homework/:homeworkId', homeworkController.authenticateToken, homeworkController.deleteHomework);

module.exports = router;
