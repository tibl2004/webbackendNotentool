const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index'); // Pool zur Datenbankverbindung

const berufeController = {
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

    // Alle Berufe abrufen
    getBerufe: async (req, res) => {
        try {
            const [berufe] = await pool.query("SELECT id, name, ausbildungsdauer, eba, efz, pra FROM berufe");
            res.json({ data: berufe });
        } catch (error) {
            console.error("Fehler beim Abrufen der Berufe:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Berufe." });
        }
    },

    // Beruf nach ID abrufen
    getBerufById: async (req, res) => {
        const { id } = req.params;
        try {
            const [beruf] = await pool.query("SELECT * FROM berufe WHERE id = ?", [id]);

            if (beruf.length === 0) {
                return res.status(404).json({ error: "Beruf nicht gefunden." });
            }

            res.json({ data: beruf[0] });
        } catch (error) {
            console.error("Fehler beim Abrufen des Berufs:", error);
            res.status(500).json({ error: "Fehler beim Abrufen des Berufs." });
        }
    },

    // Beruf hinzufügen
    addBeruf: async (req, res) => {
        const berufe = req.body; // Array von Berufen

        try {
            const sql = "INSERT INTO berufe (name, ausbildungsdauer, eba, efz, pra) VALUES ?";
            const values = berufe.map(beruf => {
                // Name anpassen, je nach dem ob efz, eba oder pra true sind
                let berufName = beruf.name;
                if (beruf.efz) berufName += " EFZ";
                if (beruf.eba) berufName += " EBA";
                if (beruf.pra) berufName += " PRA";

                return [berufName, beruf.ausbildungsdauer, beruf.eba, beruf.efz, beruf.pra];
            });

            await pool.query(sql, [values]);

            res.status(201).json({ message: "Berufe erfolgreich hinzugefügt." });
        } catch (error) {
            console.error("Fehler beim Hinzufügen der Berufe:", error);
            res.status(500).json({ error: "Fehler beim Hinzufügen der Berufe." });
        }
    },

    // Beruf aktualisieren
    updateBeruf: async (req, res) => {
        const { id } = req.params;
        const { name, ausbildungsdauer, eba, efz, pra } = req.body;

        try {
            // Name anpassen, je nach dem ob efz, eba oder pra true sind
            let berufName = name;
            if (efz) berufName += " (EFZ)";
            if (eba) berufName += " (EBA)";
            if (pra) berufName += " (PRA)";

            const sql = "UPDATE berufe SET name = ?, ausbildungsdauer = ?, eba = ?, efz = ?, pra = ? WHERE id = ?";
            await pool.query(sql, [berufName, ausbildungsdauer, eba, efz, pra, id]);

            res.status(200).json({ message: "Beruf erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Berufs:", error);
            res.status(500).json({ error: "Fehler beim Aktualisieren des Berufs." });
        }
    },

    // Beruf löschen
    deleteBeruf: async (req, res) => {
        const { id } = req.params;

        try {
            const sql = "DELETE FROM berufe WHERE id = ?";
            await pool.query(sql, [id]);

            res.status(200).json({ message: "Beruf erfolgreich gelöscht." });
        } catch (error) {
            console.error("Fehler beim Löschen des Berufs:", error);
            res.status(500).json({ error: "Fehler beim Löschen des Berufs." });
        }
    }
};

module.exports = berufeController;
