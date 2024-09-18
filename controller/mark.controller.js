const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index'); // Pool zur Datenbankverbindung

const markController = {
    // Authentifizierungsmiddleware zum Verifizieren des JWT-Tokens
    authenticateToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Extrahiere den Token aus dem Authorization Header

        if (!token) return res.status(401).json({ error: 'Kein Token bereitgestellt.' });

        jwt.verify(token, 'secretKey', (err, user) => {
            if (err) {
                console.error('Token Überprüfung Fehlgeschlagen:', err);
                return res.status(403).json({ error: 'Ungültiger Token.' });
            }
            req.user = user; // Setze die Benutzerinformationen aus dem Token
            next();
        });
    },

     // Noten für ein Fach abrufen
 getMarks: async (req, res) => {
    try {
        const { fachId } = req.params; // Fach-ID aus den URL-Parametern

        // Abrufen aller Noten für das angegebene Fach
        const [noten] = await pool.query("SELECT * FROM note WHERE fach_id = ?", [fachId]);

        if (noten.length === 0) {
            return res.status(404).json({ message: "Keine Noten gefunden." });
        }

        res.status(200).json({ data: noten });
    } catch (error) {
        console.error("Fehler beim Abrufen der Noten:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Noten." });
    }
},

    addMark: async (req, res) => {
        try {
            const { titel, note } = req.body;
            const fachId = req.params.fachId;
            const lernenderId = req.user.id;
    
            if (req.user.userType !== 'lehrbetrieb' && req.user.userType !== 'berufsbildner' && req.user.userType !== 'lernender') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Lehrbetrieb, Berufsbildner oder Lernender können Noten hinzufügen.' });
            }
    
            const sql = `
                INSERT INTO note (fach_id, titel, note, lernender_id)
                VALUES (?, ?, ?, ?)
            `;
            const values = [fachId, titel, note, lernenderId];
            await pool.query(sql, values);
    
            res.status(201).json({ message: "Note erfolgreich hinzugefügt." });
        } catch (error) {
            console.error("Fehler beim Hinzufügen der Note:", error); // Ausgabe des Fehlerdetails
            res.status(500).json({ error: "Fehler beim Hinzufügen der Note." });
        }
    },

    editMark: async (req, res) => {
        try {
            const { noteId } = req.params; // Note-ID aus den URL-Parametern
            const { titel, note } = req.body; // Titel und Note aus dem Request-Body
            const lernenderId = req.user.id; // Lernender-ID aus dem Token des angemeldeten Benutzers
    
            // Überprüfen, ob der Benutzer die erforderlichen Berechtigungen hat
            if (req.user.userType !== 'lehrbetrieb' && req.user.userType !== 'berufsbildner' && req.user.userType !== 'lernender') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Lehrbetrieb, Berufsbildner oder Lernender können Noten bearbeiten.' });
            }
    
            // SQL-Abfrage zum Aktualisieren der Note
            const sql = `
                UPDATE note 
                SET titel = ?, note = ? 
                WHERE id = ? AND lernender_id = ? AND fach_id = ?
            `;
            const values = [titel, note, noteId, lernenderId, req.params.fachId]; // Werte für die Abfrage
    
            // Führe die Aktualisierung durch
            const [result] = await pool.query(sql, values);
    
            // Überprüfe, ob eine Note aktualisiert wurde
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Note nicht gefunden oder keine Berechtigung zur Bearbeitung." });
            }
    
            // Erfolgsantwort senden
            res.status(200).json({ message: "Note erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Bearbeiten der Note:", error); // Ausgabe des Fehlerdetails
            res.status(500).json({ error: "Fehler beim Bearbeiten der Note." });
        }
    },

    deleteMark: async (req, res) => {
        try {
            const { noteId } = req.params; // Noten-ID aus den URL-Parametern
    
            if (req.user.userType !== 'lehrbetrieb' && req.user.userType !== 'berufsbildner' && req.user.userType !== 'lernender') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Lehrbetrieb, Berufsbildner oder Lernender können Noten hinzufügen.' });
            }
            
            console.log(`Lösche Note mit ID: ${noteId}`); // Logging für Debugging
    
            const sql = 'DELETE FROM note WHERE id = ?';
            const values = [noteId];
            const result = await pool.query(sql, values);
            
            console.log('Lösch-Resultat:', result); // Logging für Debugging
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Note nicht gefunden.' });
            }
    
            res.status(200).json({ message: 'Note erfolgreich gelöscht.' });
        } catch (error) {
            console.error('Fehler beim Löschen der Note:', error);
            res.status(500).json({ error: 'Fehler beim Löschen der Note.' });
        }
    }
    
   
};

module.exports = markController;
