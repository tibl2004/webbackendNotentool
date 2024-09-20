const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index'); // Pool zur Datenbankverbindung

const markController = {
    // Authentifizierungsmiddleware
    authenticateToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({ error: 'Kein Token bereitgestellt.' });

        jwt.verify(token, 'secretKey', (err, user) => {
            if (err) {
                console.error('Token Überprüfung fehlgeschlagen:', err);
                return res.status(403).json({ error: 'Ungültiger Token.' });
            }
            req.user = user;
            next();
        });
    },

    // Noten für ein Fach abrufen
    getMarks: async (req, res) => {
        try {
            const { fachId } = req.params;

            const [noten] = await pool.query("SELECT * FROM note WHERE fach_id = ?", [fachId]);

            if (noten.length === 0) {
                return res.status(404).json({ message: "Keine Noten gefunden." });
            }

            await calculateAndUpdateAverage(fachId); // Durchschnitt aktualisieren

            res.status(200).json({ data: noten });
        } catch (error) {
            console.error("Fehler beim Abrufen der Noten:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Noten." });
        }
    },

    // Note hinzufügen
    addMark: async (req, res) => {
        try {
            const { titel, note } = req.body;
            const fachId = req.params.fachId;
            const lernenderId = req.user.id;

            if (req.user.userType !== 'lehrbetrieb' && req.user.userType !== 'berufsbildner' && req.user.userType !== 'lernender') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Lehrbetrieb, Berufsbildner oder Lernender können Noten hinzufügen.' });
            }

            const sql = "INSERT INTO note (fach_id, titel, note, lernender_id) VALUES (?, ?, ?, ?)";
            await pool.query(sql, [fachId, titel, note, lernenderId]);

            await calculateAndUpdateAverage(fachId); // Durchschnitt aktualisieren

            res.status(201).json({ message: "Note erfolgreich hinzugefügt." });
        } catch (error) {
            console.error("Fehler beim Hinzufügen der Note:", error);
            res.status(500).json({ error: "Fehler beim Hinzufügen der Note." });
        }
    },

    // Note bearbeiten
    editMark: async (req, res) => {
        try {
            const { noteId } = req.params;
            const { titel, note } = req.body;
            const lernenderId = req.user.id;

            if (req.user.userType !== 'lehrbetrieb' && req.user.userType !== 'berufsbildner' && req.user.userType !== 'lernender') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Lehrbetrieb, Berufsbildner oder Lernender können Noten bearbeiten.' });
            }

            const sql = "UPDATE note SET titel = ?, note = ? WHERE id = ? AND lernender_id = ? AND fach_id = ?";
            await pool.query(sql, [titel, note, noteId, lernenderId, req.params.fachId]);

            await calculateAndUpdateAverage(req.params.fachId); // Durchschnitt aktualisieren

            res.status(200).json({ message: "Note erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Bearbeiten der Note:", error);
            res.status(500).json({ error: "Fehler beim Bearbeiten der Note." });
        }
    },

    // Note löschen
    deleteMark: async (req, res) => {
        try {
            const { noteId } = req.params;

            if (req.user.userType !== 'lehrbetrieb' && req.user.userType !== 'berufsbildner' && req.user.userType !== 'lernender') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Lehrbetrieb, Berufsbildner oder Lernender können Noten löschen.' });
            }

            const sql = "DELETE FROM note WHERE id = ?";
            await pool.query(sql, [noteId]);

            await calculateAndUpdateAverage(req.params.fachId); // Durchschnitt aktualisieren

            res.status(200).json({ message: 'Note erfolgreich gelöscht.' });
        } catch (error) {
            console.error('Fehler beim Löschen der Note:', error);
            res.status(500).json({ error: 'Fehler beim Löschen der Note.' });
        }
    }
};

// Funktion zum Berechnen und Aktualisieren des Notendurchschnitts
const calculateAndUpdateAverage = async (fachId) => {
    const [noten] = await pool.query("SELECT AVG(note) as average FROM note WHERE fach_id = ?", [fachId]);
    const average = noten[0].average || null; // Wenn keine Noten vorhanden sind, setze den Durchschnitt auf null
    await pool.query("UPDATE fach SET notendurchschnitt = ? WHERE id = ?", [average, fachId]);
};

module.exports = markController;
