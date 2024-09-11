const express = require('express');
const homeworkController = require('../controller/homework.controller'); // Pfad zum Controller anpassen

const router = express.Router();

// Hausaufgabe hinzufügen (mit Authentifizierung und FachID)
router.post('/', homeworkController.authenticateToken, homeworkController.createHomework);

// Alle Hausaufgaben eines Lernenden abrufen (mit Authentifizierung)
router.get('/', homeworkController.authenticateToken, homeworkController.getHomeworksByLernenderId);

// Hausaufgabe anhand der ID abrufen (mit Authentifizierung)
router.get('/:homeworkId', homeworkController.authenticateToken, homeworkController.getHomeworkById);

// Hausaufgabe aktualisieren (Erledigt-Status) (mit Authentifizierung)
router.put('/:homeworkId', homeworkController.authenticateToken, homeworkController.updateHomeworkStatus);

// Hausaufgabe löschen (mit Authentifizierung)
router.delete('/:homeworkId', homeworkController.authenticateToken, homeworkController.deleteHomework);

module.exports = router;
