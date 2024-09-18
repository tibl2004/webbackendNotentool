const express = require('express');
const router = express.Router();
const markController = require('../controller/mark.controller');

// Middleware zur Authentifizierung
router.use(markController.authenticateToken);

// Routen
router.get('/fach/:fachId/marks', markController.getMarks); // Noten für ein bestimmtes Fach abrufen
router.post('/fach/:fachId/marks', markController.addMark); // Note zu einem Fach hinzufügen
router.put('/fach/:fachId/marks/:noteId', markController.editMark); // Eine Note bearbeiten
router.delete('/fach/:fachId/marks/:noteId', markController.deleteMark); // Eine Note löschen

module.exports = router;
