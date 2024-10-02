const jwt = require('jsonwebtoken');
const pool = require('../database/index'); // Pool zur Datenbankverbindung

const berufsbildnerController = {
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

    // Lernende abrufen, die diesem Berufsbildner zugeordnet sind
    getLernende: async (req, res) => {
        try {
            const { berufsbildnerId } = req.user; // Die Berufsbildner-ID sollte aus dem Token abgerufen werden

            const [lernende] = await pool.query(
                'SELECT * FROM lernender WHERE berufsbildner_id = ?',
                [berufsbildnerId]
            );

            if (lernende.length === 0) {
                return res.status(404).json({ message: "Keine Lernenden gefunden." });
            }

            res.status(200).json({ data: lernende });
        } catch (error) {
            console.error("Fehler beim Abrufen der Lernenden:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Lernenden." });
        }
    },

    // Fächer und Notendurchschnitt für einen bestimmten Lernenden abrufen
    getFaecherUndNotendurchschnitte: async (req, res) => {
        try {
            const { lernenderId } = req.params; // Lernender-ID aus den URL-Parametern

            // Überprüfen, ob der angegebene Lernende diesem Berufsbildner zugeordnet ist
            const [learnerCheck] = await pool.query(
                'SELECT * FROM lernender WHERE id = ? AND berufsbildner_id = ?',
                [lernenderId, req.user.berufsbildnerId]
            );

            if (learnerCheck.length === 0) {
                return res.status(403).json({ message: "Zugriff verweigert. Dieser Lernende gehört nicht zu Ihnen." });
            }

            const [faecher] = await pool.query(
                `SELECT f.id AS fach_id, f.fachname, AVG(n.note) AS notendurchschnitt
                 FROM fach f
                 LEFT JOIN note n ON f.id = n.fach_id AND n.lernender_id = ?
                 GROUP BY f.id`,
                [lernenderId]
            );

            if (faecher.length === 0) {
                return res.status(404).json({ message: "Keine Fächer für diesen Lernenden gefunden." });
            }

            res.status(200).json({ data: faecher });
        } catch (error) {
            console.error("Fehler beim Abrufen der Fächer und Notendurchschnitte:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Fächer und Notendurchschnitte." });
        }
    },

    // Noten für ein bestimmtes Fach eines Lernenden abrufen
    getNotenForFach: async (req, res) => {
        try {
            const { lernenderId, fachId } = req.params; // Lernender-ID und Fach-ID aus den URL-Parametern

            // Überprüfen, ob der angegebene Lernende diesem Berufsbildner zugeordnet ist
            const [learnerCheck] = await pool.query(
                'SELECT * FROM lernender WHERE id = ? AND berufsbildner_id = ?',
                [lernenderId, req.user.berufsbildnerId]
            );

            if (learnerCheck.length === 0) {
                return res.status(403).json({ message: "Zugriff verweigert. Dieser Lernende gehört nicht zu Ihnen." });
            }

            const [noten] = await pool.query(
                `SELECT n.note 
                 FROM note n 
                 WHERE n.lernender_id = ? AND n.fach_id = ?`,
                [lernenderId, fachId]
            );

            if (noten.length === 0) {
                return res.status(404).json({ message: "Keine Noten für dieses Fach gefunden." });
            }

            res.status(200).json({ data: noten });
        } catch (error) {
            console.error("Fehler beim Abrufen der Noten:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Noten." });
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

module.exports = berufsbildnerController;
