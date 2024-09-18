const express = require('express');
const router = express.Router();
const notesController = require('../controller/notes.controller');

// Authentifizierungsmiddleware auf alle Routen anwenden
router.use(notesController.authenticateToken);

// Routen für Notizen
// Notiz erstellen
router.post('/', notesController.createNote);

// Alle Notizen für ein Fach abrufen
router.get('/:fachId', notesController.getNotesByFachId);

// Notiz aktualisieren
router.put('/:noteId', notesController.updateNote);

// Notiz löschen
router.delete('/:noteId', notesController.deleteNote);

module.exports = router;
