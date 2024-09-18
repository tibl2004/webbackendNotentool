const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index'); // Pool zur Datenbankverbindung

const notesController = {
    // Authentifizierungsmiddleware
    authenticateToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; 

        if (!token) return res.status(401).json({ error: 'Kein Token bereitgestellt.' });

        jwt.verify(token, 'secretKey', (err, user) => {
            if (err) {
                console.error('Token Überprüfung Fehlgeschlagen:', err);
                return res.status(403).json({ error: 'Ungültiger Token.' });
            }
            req.user = user; 
            next();
        });
    },

    // Notiz erstellen
    createNote: async (req, res) => {
        try {
            const { fachId, title, text, imgLink, date } = req.body;
            const lernenderId = req.user.id; // Authentifizierter Lernender

            // Überprüfen, ob das Fach dem Lernenden zugeordnet ist
            const [fach] = await pool.query("SELECT * FROM fach WHERE id = ? AND lernender_id = ?", [fachId, lernenderId]);

            if (fach.length === 0) {
                return res.status(403).json({ error: 'Zugriff verweigert: Fach nicht gefunden oder nicht zugeordnet.' });
            }

            const sql = `
                INSERT INTO notizen (fach_id, title, text, img_link, date, lernender_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const values = [fachId, title, text, imgLink, date, lernenderId];
            await pool.query(sql, values);

            res.status(201).json({ message: "Notiz erfolgreich erstellt." });
        } catch (error) {
            console.error("Fehler beim Erstellen der Notiz:", error);
            res.status(500).json({ error: "Fehler beim Erstellen der Notiz." });
        }
    },

    // Alle Notizen für ein Fach abrufen
    getNotesByFachId: async (req, res) => {
        try {
            const { fachId } = req.params;
            const lernenderId = req.user.id; // Authentifizierter Lernender

            // Überprüfen, ob das Fach dem Lernenden zugeordnet ist
            const [fach] = await pool.query("SELECT * FROM fach WHERE id = ? AND lernender_id = ?", [fachId, lernenderId]);

            if (fach.length === 0) {
                return res.status(403).json({ error: 'Zugriff verweigert: Fach nicht gefunden oder nicht zugeordnet.' });
            }

            // Notizen für das Fach abrufen
            const [notes] = await pool.query("SELECT * FROM notizen WHERE fach_id = ?", [fachId]);

            res.json({ data: notes });
        } catch (error) {
            console.error("Fehler beim Abrufen der Notizen:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Notizen." });
        }
    },

    // Notiz aktualisieren
    updateNote: async (req, res) => {
        try {
            const { noteId } = req.params;
            const { title, text, imgLink, date } = req.body;
            const lernenderId = req.user.id;

            // Überprüfen, ob die Notiz dem Lernenden gehört
            const [note] = await pool.query("SELECT * FROM notizen WHERE id = ? AND lernender_id = ?", [noteId, lernenderId]);

            if (note.length === 0) {
                return res.status(403).json({ error: 'Zugriff verweigert: Notiz nicht gefunden oder nicht zugeordnet.' });
            }

            const sql = `
                UPDATE notizen
                SET title = ?, text = ?, img_link = ?, date = ?
                WHERE id = ? AND lernender_id = ?
            `;
            const values = [title, text, imgLink, date, noteId, lernenderId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Notiz erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Aktualisieren der Notiz:", error);
            res.status(500).json({ error: "Fehler beim Aktualisieren der Notiz." });
        }
    },

    // Notiz löschen
    deleteNote: async (req, res) => {
        try {
            const { noteId } = req.params;
            const lernenderId = req.user.id;

            // Überprüfen, ob die Notiz dem Lernenden gehört
            const [note] = await pool.query("SELECT * FROM notizen WHERE id = ? AND lernender_id = ?", [noteId, lernenderId]);

            if (note.length === 0) {
                return res.status(403).json({ error: 'Zugriff verweigert: Notiz nicht gefunden oder nicht zugeordnet.' });
            }

            const sql = `
                DELETE FROM notizen
                WHERE id = ? AND lernender_id = ?
            `;
            const values = [noteId, lernenderId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Notiz erfolgreich gelöscht." });
        } catch (error) {
            console.error("Fehler beim Löschen der Notiz:", error);
            res.status(500).json({ error: "Fehler beim Löschen der Notiz." });
        }
    }
};

module.exports = notesController;
