const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index'); // Pool zur Datenbankverbindung

const homeworkController = {
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

    // Hausaufgabe erstellen (mit FachID)
   // Hausaufgabe erstellen (Lernenden-ID automatisch erkennen und FachID übergeben)
createHomework: async (req, res) => {
    try {
        const lernenderId = req.user.id; // Authentifizierter Lernender
        const { titel, beschreibung, abgabedatum, fach_id } = req.body; // FachID wird vom Frontend übergeben

        const sql = `
            INSERT INTO hausaufgabe (lernender_id, titel, beschreibung, abgabedatum, erledigt, fach_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [lernenderId, titel, beschreibung, abgabedatum, false, fach_id]; // FachID wird gespeichert
        await pool.query(sql, values);

        res.status(201).json({ message: "Hausaufgabe erfolgreich erstellt." });
    } catch (error) {
        console.error("Fehler beim Erstellen der Hausaufgabe:", error);
        res.status(500).json({ error: "Fehler beim Erstellen der Hausaufgabe." });
    }
},

   // Alle Hausaufgaben für einen Lernenden abrufen
getHomeworksByLernenderId: async (req, res) => {
    try {
        const lernenderId = req.user.id; // Authentifizierter Lernender
        const [homeworks] = await pool.query("SELECT * FROM hausaufgabe WHERE lernender_id = ?", [lernenderId]);

        res.json({ data: homeworks }); // Enthält auch die FachID
    } catch (error) {
        console.error("Fehler beim Abrufen der Hausaufgaben:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Hausaufgaben." });
    }
},

    // Hausaufgabe nach ID abrufen
    getHomeworkById: async (req, res) => {
        try {
            const { homeworkId } = req.params;
            const lernenderId = req.user.id; // Authentifizierter Lernender
            const [homework] = await pool.query("SELECT * FROM hausaufgabe WHERE id = ? AND lernender_id = ?", [homeworkId, lernenderId]);

            if (homework.length === 0) {
                return res.status(404).json({ error: "Hausaufgabe nicht gefunden oder nicht autorisiert." });
            }

            res.json({ data: homework[0] });
        } catch (error) {
            console.error("Fehler beim Abrufen der Hausaufgabe:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Hausaufgabe." });
        }
    },

    // Hausaufgabe aktualisieren (Erledigt-Status)
    updateHomeworkStatus: async (req, res) => {
        try {
            const { homeworkId } = req.params;
            const { erledigt } = req.body;
            const lernenderId = req.user.id; // Authentifizierter Lernender

            const sql = `
                UPDATE hausaufgabe
                SET erledigt = ?
                WHERE id = ? AND lernender_id = ?
            `;
            const values = [erledigt, homeworkId, lernenderId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Hausaufgabe erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Aktualisieren der Hausaufgabe:", error);
            res.status(500).json({ error: "Fehler beim Aktualisieren der Hausaufgabe." });
        }
    },

    // Hausaufgabe löschen
    deleteHomework: async (req, res) => {
        try {
            const { homeworkId } = req.params;
            const lernenderId = req.user.id; // Authentifizierter Lernender

            const sql = `
                DELETE FROM hausaufgabe
                WHERE id = ? AND lernender_id = ?
            `;
            const values = [homeworkId, lernenderId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Hausaufgabe erfolgreich gelöscht." });
        } catch (error) {
            console.error("Fehler beim Löschen der Hausaufgabe:", error);
            res.status(500).json({ error: "Fehler beim Löschen der Hausaufgabe." });
        }
    }
};

module.exports = homeworkController;
