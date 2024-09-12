const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index'); // Pool zur Datenbankverbindung
const cron = require('node-cron'); // Für den Cron-Job

const examController = {
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

    // Prüfung erstellen
    createExam: async (req, res) => {
        try {
            const { titel, beschreibung, prüfungsdatum } = req.body;

            const sql = `
                INSERT INTO prüfung (titel, beschreibung, prüfungsdatum)
                VALUES (?, ?, ?)
            `;
            const values = [titel, beschreibung, prüfungsdatum];
            await pool.query(sql, values);

            res.status(201).json({ message: "Prüfung erfolgreich erstellt." });
        } catch (error) {
            console.error("Fehler beim Erstellen der Prüfung:", error);
            res.status(500).json({ error: "Fehler beim Erstellen der Prüfung." });
        }
    },

    // Alle Prüfungen abrufen
    getExams: async (req, res) => {
        try {
            const [exams] = await pool.query("SELECT * FROM prüfung");
            res.json({ data: exams });
        } catch (error) {
            console.error("Fehler beim Abrufen der Prüfungen:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Prüfungen." });
        }
    },

    // Prüfung nach ID abrufen
    getExamById: async (req, res) => {
        try {
            const { examId } = req.params;
            const [exam] = await pool.query("SELECT * FROM prüfung WHERE id = ?", [examId]);

            if (exam.length === 0) {
                return res.status(404).json({ error: "Prüfung nicht gefunden." });
            }

            res.json({ data: exam[0] });
        } catch (error) {
            console.error("Fehler beim Abrufen der Prüfung:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Prüfung." });
        }
    },

    // Prüfung aktualisieren
    updateExam: async (req, res) => {
        try {
            const { examId } = req.params;
            const { titel, beschreibung, prüfungsdatum } = req.body;

            const sql = `
                UPDATE prüfung
                SET titel = ?, beschreibung = ?, prüfungsdatum = ?
                WHERE id = ?
            `;
            const values = [titel, beschreibung, prüfungsdatum, examId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Prüfung erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Aktualisieren der Prüfung:", error);
            res.status(500).json({ error: "Fehler beim Aktualisieren der Prüfung." });
        }
    },

    // Prüfung löschen
    deleteExam: async (req, res) => {
        try {
            const { examId } = req.params;

            const sql = `
                DELETE FROM prüfung
                WHERE id = ?
            `;
            const values = [examId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Prüfung erfolgreich gelöscht." });
        } catch (error) {
            console.error("Fehler beim Löschen der Prüfung:", error);
            res.status(500).json({ error: "Fehler beim Löschen der Prüfung." });
        }
    }
};

// Cron-Job zum automatischen Löschen von abgelaufenen Prüfungen
cron.schedule('0 0 * * *', async () => {
    try {
        const sql = `
            DELETE FROM prüfung
            WHERE prüfungsdatum < NOW()
        `;
        await pool.query(sql);
        console.log('Abgelaufene Prüfungen wurden gelöscht.');
    } catch (error) {
        console.error('Fehler beim Löschen der abgelaufenen Prüfungen:', error);
    }
});

module.exports = examController;
