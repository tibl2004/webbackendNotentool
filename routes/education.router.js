const express = require('express');
const { educationController, authenticateToken, checkUserType } = require('../controller/education.controller');
const router = express.Router();

// Admin-Routen
router.post('/admin/register', educationController.registerAdmin);
router.get('/admin/lehrbetriebe', authenticateToken, checkUserType('admin'), educationController.getAllLehrbetriebe);

// Lehrbetrieb-Routen
router.post('/lehrbetrieb/register', educationController.registerLehrbetrieb);
router.get('/lehrbetrieb/own', authenticateToken, checkUserType('lehrbetrieb'), educationController.getOwnLehrbetrieb);

// Berufsbildner-Routen
router.post('/berufsbildner/register', educationController.registerBerufsbildner);

// Lernenden-Routen
router.post('/lernender/register', authenticateToken, checkUserType('berufsbildner'), educationController.registerLernender);
router.get('/lernende/mit-faecher', authenticateToken, checkUserType('berufsbildner'), educationController.getLernendeMitFaecher);
router.post('/lernender/:lernenderId/fach', authenticateToken, checkUserType('berufsbildner'), educationController.addFach);
router.get('/lernender/:lernenderId/faecher', authenticateToken, checkUserType('berufsbildner'), educationController.getFaecher);
router.post('/lernender/:lernenderId/note', authenticateToken, checkUserType('berufsbildner'), educationController.addNote);
router.get('/fach/:fachId/noten', authenticateToken, checkUserType('berufsbildner'), educationController.getNoten);

// Login
router.post('/login', educationController.login);

module.exports = router;
