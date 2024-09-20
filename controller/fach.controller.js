const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index'); // Pool zur Datenbankverbindung

const fachController = {
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

    // Fächer mit Notendurchschnitt abrufen
    getFaecher: async (req, res) => {
        try {
            const lernenderId = req.user.id;

            const [faecher] = await pool.query("SELECT id, fachname, notendurchschnitt FROM fach WHERE lernender_id = ?", [lernenderId]);

            res.json({ data: faecher });
        } catch (error) {
            console.error("Fehler beim Abrufen der Fächer:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Fächer." });
        }
    },

    // Fach hinzufügen
    addFach: async (req, res) => {
        try {
            const { fachname } = req.body;
            const lernenderId = req.user.id;

            if (req.user.userType !== 'lehrbetrieb' && req.user.userType !== 'berufsbildner' && req.user.userType !== 'lernender') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Lehrbetrieb, Berufsbildner oder Lernender können Fächer hinzufügen.' });
            }

            const sql = "INSERT INTO fach (lernender_id, fachname) VALUES (?, ?)";
            await pool.query(sql, [lernenderId, fachname]);

            res.status(201).json({ message: "Fach erfolgreich hinzugefügt." });
        } catch (error) {
            console.error("Fehler beim Hinzufügen des Fachs:", error);
            res.status(500).json({ error: "Fehler beim Hinzufügen des Fachs." });
        }
    },

    // Fach aktualisieren
    updateFach: async (req, res) => {
        try {
            const { fachId } = req.params;
            const { fachname } = req.body;

            const sql = "UPDATE fach SET fachname = ? WHERE id = ?";
            await pool.query(sql, [fachname, fachId]);

            res.status(200).json({ message: "Fach erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Fachs:", error);
            res.status(500).json({ error: "Fehler beim Aktualisieren des Fachs." });
        }
    },

    // Fach löschen
    deleteFach: async (req, res) => {
        try {
            const { fachId } = req.params;

            const sql = "DELETE FROM fach WHERE id = ?";
            await pool.query(sql, [fachId]);

            res.status(200).json({ message: "Fach erfolgreich gelöscht." });
        } catch (error) {
            console.error("Fehler beim Löschen des Fachs:", error);
            res.status(500).json({ error: "Fehler beim Löschen des Fachs." });
        }
    }
};

module.exports = fachController;
