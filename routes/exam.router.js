const express = require('express');
const examController = require('../controller/exam.controller');
const router = express.Router();

// Alle Prüfungen abrufen (mit Authentifizierung)
router.get('/', examController.authenticateToken, examController.getExams);

// Prüfung erstellen
router.post('/', examController.authenticateToken, examController.createExam);

// Alle Prüfungen für einen Lernenden abrufen
router.get('/exams/:lernenderId', examController.authenticateToken, examController.getExamsByLernenderId);

// Prüfung nach ID abrufen
router.get('/:examId', examController.authenticateToken, examController.getExamById);

// Prüfung aktualisieren
router.put('/:examId', examController.authenticateToken, examController.updateExam);

// Prüfung löschen
router.delete('/:examId', examController.authenticateToken, examController.deleteExam);

module.exports = router;
