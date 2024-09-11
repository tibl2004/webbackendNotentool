const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index');

const homeworkController = {
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

    // Hausaufgabe erstellen (Lernenden-ID automatisch erkennen)
    createHomework: async (req, res) => {
        try {
            const lernenderId = req.user.id; // Authentifizierter Lernender
            const { titel, beschreibung, abgabedatum } = req.body;

            const sql = `
                INSERT INTO hausaufgabe (lernender_id, titel, beschreibung, abgabedatum, erledigt)
                VALUES (?, ?, ?, ?, ?)
            `;
            const values = [lernenderId, titel, beschreibung, abgabedatum, false];
            await pool.query(sql, values);

            res.status(201).json({ message: "Hausaufgabe erfolgreich erstellt." });
        } catch (error) {
            console.error("Fehler beim Erstellen der Hausaufgabe:", error);
            res.status(500).json({ error: "Fehler beim Erstellen der Hausaufgabe." });
        }
    },

    // Hausaufgaben für einen Lernenden abrufen
    getHomeworksByLernenderId: async (req, res) => {
        try {
            const lernenderId = req.user.id; // Authentifizierter Lernender
            const [homeworks] = await pool.query("SELECT * FROM hausaufgabe WHERE lernender_id = ?", [lernenderId]);
            res.json({ data: homeworks });
        } catch (error) {
            console.error("Fehler beim Abrufen der Hausaufgaben:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Hausaufgaben." });
        }
    },

    // Hausaufgabe aktualisieren (Erledigt-Status)
    updateHomeworkStatus: async (req, res) => {
        try {
            const { homeworkId } = req.params;
            const { erledigt } = req.body;

            const sql = `
                UPDATE hausaufgabe
                SET erledigt = ?
                WHERE id = ? AND lernender_id = ?
            `;
            const values = [erledigt, homeworkId, req.user.id];
            await pool.query(sql, values);

            res.status(200).json({ message: "Hausaufgabe erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Aktualisieren der Hausaufgabe:", error);
            res.status(500).json({ error: "Fehler beim Aktualisieren der Hausaufgabe." });
        }
    },

    // Hausaufgabe abrufen nach ID
    getHomeworkById: async (req, res) => {
        try {
            const { homeworkId } = req.params;
            const [homework] = await pool.query("SELECT * FROM hausaufgabe WHERE id = ? AND lernender_id = ?", [homeworkId, req.user.id]);

            if (homework.length === 0) {
                return res.status(404).json({ error: "Hausaufgabe nicht gefunden oder nicht autorisiert." });
            }

            res.json({ data: homework[0] });
        } catch (error) {
            console.error("Fehler beim Abrufen der Hausaufgabe:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Hausaufgabe." });
        }
    },

    // Hausaufgabe löschen
    deleteHomework: async (req, res) => {
        try {
            const { homeworkId } = req.params;

            const sql = `
                DELETE FROM hausaufgabe
                WHERE id = ? AND lernender_id = ?
            `;
            const values = [homeworkId, req.user.id];
            await pool.query(sql, values);

            res.status(200).json({ message: "Hausaufgabe erfolgreich gelöscht." });
        } catch (error) {
            console.error("Fehler beim Löschen der Hausaufgabe:", error);
            res.status(500).json({ error: "Fehler beim Löschen der Hausaufgabe." });
        }
    }
};

module.exports = homeworkController;
