const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index'); // Pool zur Datenbankverbindung

const lernenderController = {
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

    

    // Lernender mit ID abrufen
    getLernenderById: async (req, res) => {
        try {
            const { id } = req.params; // Lernende-ID aus URL-Parametern

            // Abrufen des Lernenden basierend auf der ID
            const [lernender] = await pool.query("SELECT * FROM lernender WHERE id = ?", [id]);

            if (lernender.length === 0) {
                return res.status(404).json({ message: "Lernender nicht gefunden." });
            }

            res.status(200).json({ data: lernender[0] });
        } catch (error) {
            console.error("Fehler beim Abrufen des Lernenden:", error);
            res.status(500).json({ error: "Fehler beim Abrufen des Lernenden." });
        }
    },

    // Lernenden aktualisieren (Nur Lehrbetrieb oder Berufsbildner)
    updateLernender: async (req, res) => {
        const { lernenderId } = req.params;
        const { benutzername, name, vorname, beruf, berufsschule } = req.body;

        try {
            // Überprüfen, ob der Benutzer ein Lehrbetrieb oder Berufsbildner ist
            if (req.user.userType !== 'lehrbetrieb' && req.user.userType !== 'berufsbildner') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Lehrbetrieb oder Berufsbildner können Lernende aktualisieren.' });
            }

            const sql = `
                UPDATE lernender 
                SET benutzername = ?, name = ?, vorname = ?, beruf = ?, berufsschule = ?, berufsbildner_id = ?
                WHERE id = ?
            `;
            const values = [benutzername, name, vorname, beruf, berufsschule, req.user.id, lernenderId];
            const result = await pool.query(sql, values);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Lernender nicht gefunden." });
            }

            res.status(200).json({ message: "Lernender erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Lernenden:", error);
            res.status(500).json({ error: "Fehler beim Aktualisieren des Lernenden." });
        }
    },

    // Lernenden löschen (Nur für Lehrbetrieb oder Berufsbildner)
    deleteLernender: async (req, res) => {
        const { id } = req.params;

        try {
            // Überprüfen, ob der Benutzer ein Lehrbetrieb oder Berufsbildner ist
            if (req.user.userType !== 'lehrbetrieb' && req.user.userType !== 'berufsbildner') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Lehrbetrieb oder Berufsbildner können Lernende löschen.' });
            }

            const result = await pool.query("DELETE FROM lernender WHERE id = ?", [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Lernender nicht gefunden." });
            }

            res.status(200).json({ message: "Lernender erfolgreich gelöscht." });
        } catch (error) {
            console.error("Fehler beim Löschen des Lernenden:", error);
            res.status(500).json({ error: "Fehler beim Löschen des Lernenden." });
        }
    }
};

module.exports = lernenderController;
