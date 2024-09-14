const express = require('express');
const teacherController = require('../controller/teacher.controller'); // Pfad zum Controller anpassen

const router = express.Router();

// Lehrer hinzufügen (mit Authentifizierung)
router.post('/', teacherController.authenticateToken, teacherController.createTeacher);

// Alle Lehrer eines Lernenden abrufen (mit Authentifizierung)
router.get('/', teacherController.authenticateToken, teacherController.getTeachersByLernenderId);

// Lehrer anhand der ID abrufen (mit Authentifizierung)
router.get('/:teacherId', teacherController.authenticateToken, teacherController.getTeacherById);

// Lehrer aktualisieren (mit Authentifizierung)
router.put('/:teacherId', teacherController.authenticateToken, teacherController.updateTeacher);

// Lehrer löschen (mit Authentifizierung)
router.delete('/:teacherId', teacherController.authenticateToken, teacherController.deleteTeacher);

module.exports = router;
