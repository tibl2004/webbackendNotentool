const express = require('express');
const examController = require('../controller/exam.controller'); // Pfad zum Controller anpassen

const router = express.Router();

// Prüfung hinzufügen (mit Authentifizierung)
router.post('/', examController.authenticateToken, examController.createExam);

// Alle Prüfungen abrufen (mit Authentifizierung)
router.get('/', examController.authenticateToken, examController.getExams);

// Prüfung anhand der ID abrufen (mit Authentifizierung)
router.get('/:examId', examController.authenticateToken, examController.getExamById);

// Prüfung aktualisieren (mit Authentifizierung)
router.put('/:examId', examController.authenticateToken, examController.updateExam);

// Prüfung löschen (mit Authentifizierung)
router.delete('/:examId', examController.authenticateToken, examController.deleteExam);

module.exports = router;
