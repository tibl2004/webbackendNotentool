const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../database/index');

const lehrbetriebController = {
    authenticateToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Extrahiere den Token

        if (!token) return res.status(401).json({ error: 'Kein Token bereitgestellt.' });

        jwt.verify(token, 'secretKey', (err, user) => {
            if (err) {
                console.error('Token Überprüfung Fehlgeschlagen:', err);
                return res.status(403).json({ error: 'Ungültiger Token.' });
            }
            req.user = user; // Die Benutzerinformationen aus dem Token zur Verfügung stellen
            next();
        });
    },

    // Lehrbetriebe dürfen nur von Admins gesehen werden
    getLehrbetriebe: async (req, res) => {
        try {
            // Nur Admins dürfen Lehrbetriebe abrufen
            if (req.user.userType !== 'admin') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Admins können Lehrbetriebe sehen.' });
            }

            const [lehrbetriebe] = await pool.query("SELECT * FROM lehrbetrieb");
            return res.json({ data: lehrbetriebe });
        } catch (error) {
            console.error("Fehler beim Abrufen der Lehrbetriebe:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Lehrbetriebe." });
        }
    },

    updateLehrbetrieb: async (req, res) => {
        const { id } = req.params;
        const { name, adresse, plz, ort } = req.body;
        try {
            // Nur Admins dürfen Lehrbetriebe aktualisieren
            if (req.user.userType !== 'admin') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Admins können Lehrbetriebe aktualisieren.' });
            }

            const result = await pool.query(
                "UPDATE lehrbetrieb SET name = ?, adresse = ?, plz = ?, ort = ? WHERE id = ?",
                [name, adresse, plz, ort, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Lehrbetrieb nicht gefunden." });
            }

            res.json({ message: "Lehrbetrieb erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Lehrbetriebs:", error);
            res.status(500).json({ error: "Fehler beim Aktualisieren des Lehrbetriebs." });
        }
    },

    deleteLehrbetrieb: async (req, res) => {
        const { id } = req.params;
        try {
            // Nur Admins dürfen Lehrbetriebe löschen
            if (req.user.userType !== 'admin') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Admins können Lehrbetriebe löschen.' });
            }

            const result = await pool.query("DELETE FROM lehrbetrieb WHERE id = ?", [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Lehrbetrieb nicht gefunden." });
            }

            res.json({ message: "Lehrbetrieb erfolgreich gelöscht." });
        } catch (error) {
            console.error("Fehler beim Löschen des Lehrbetriebs:", error);
            res.status(500).json({ error: "Fehler beim Löschen des Lehrbetriebs." });
        }
    }
};

module.exports = lehrbetriebController;
