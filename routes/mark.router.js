const express = require('express');
const markController = require('../controller/mark.controller'); // Pfad zum Mark-Controller

const router = express.Router();

// Authentifizierungsmiddleware für alle Routen
router.use(markController.authenticateToken);

// Route zum Abrufen der Noten für ein Fach
router.get('/:fachId', markController.getMarks);

// Route zum Hinzufügen einer Note
router.post('/:fachId', markController.addMark);

// Route zum Bearbeiten einer Note
router.put('/:fachId/:noteId', markController.editMark);

// Route zum Löschen einer Note
router.delete('/:fachId/:noteId', markController.deleteMark);

module.exports = router;
