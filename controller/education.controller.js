const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../database/index');

const educationController = {
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
    
    

    // Admin-Registrierung
    registerAdmin: async (req, res) => {
        try {
            const { benutzername, passwort } = req.body;

            const [existingAdmin] = await pool.query("SELECT * FROM admin WHERE benutzername = ?", [benutzername]);
            if (existingAdmin.length > 0) {
                return res.status(400).json({ error: "Benutzername bereits vergeben." });
            }

            const hashedPassword = await bcrypt.hash(passwort, 10);
            const sql = `
                INSERT INTO admin (benutzername, passwort)
                VALUES (?, ?)
            `;
            const values = [benutzername, hashedPassword];
            await pool.query(sql, values);

            res.status(201).json({ message: "Admin erfolgreich registriert." });
        } catch (error) {
            console.error("Fehler bei der Admin-Registrierung:", error);
            res.status(500).json({ error: "Fehler bei der Admin-Registrierung." });
        }
    },

    // Lehrbetrieb-Registrierung
    registerLehrbetrieb: async (req, res) => {
        try {
            const { name, adresse, benutzername, passwort } = req.body;

            const [existingLehrbetrieb] = await pool.query("SELECT * FROM lehrbetrieb WHERE benutzername = ?", [benutzername]);
            if (existingLehrbetrieb.length > 0) {
                return res.status(400).json({ error: "Benutzername bereits vergeben." });
            }

            const hashedPassword = await bcrypt.hash(passwort, 10);
            const sql = `
                INSERT INTO lehrbetrieb (name, adresse, benutzername, passwort)
                VALUES (?, ?, ?, ?)
            `;
            const values = [name, adresse, benutzername, hashedPassword];
            await pool.query(sql, values);

            res.status(201).json({ message: "Lehrbetrieb erfolgreich registriert." });
        } catch (error) {
            console.error("Fehler bei der Lehrbetrieb-Registrierung:", error);
            res.status(500).json({ error: "Fehler bei der Lehrbetrieb-Registrierung." });
        }
    },

    // Berufsbildner-Registrierung
    registerBerufsbildner: async (req, res) => {
        try {
            const { benutzername, passwort, name, vorname, lehrbetriebId } = req.body;

            const [existingBerufsbildner] = await pool.query("SELECT * FROM berufsbildner WHERE benutzername = ?", [benutzername]);
            if (existingBerufsbildner.length > 0) {
                return res.status(400).json({ error: "Benutzername bereits vergeben." });
            }

            const hashedPassword = await bcrypt.hash(passwort, 10);
            const sql = `
                INSERT INTO berufsbildner (lehrbetrieb_id, benutzername, passwort, name, vorname)
                VALUES (?, ?, ?, ?, ?)
            `;
            const values = [lehrbetriebId, benutzername, hashedPassword, name, vorname];
            await pool.query(sql, values);

            res.status(201).json({ message: "Berufsbildner erfolgreich registriert." });
        } catch (error) {
            console.error("Fehler bei der Berufsbildner-Registrierung:", error);
            res.status(500).json({ error: "Fehler bei der Berufsbildner-Registrierung." });
        }
    },

    // Lehrbetrieb kann Lernende hinzufügen
    registerLernender: async (req, res) => {
        try {
            const { benutzername, passwort, name, vorname, beruf, berufsschule } = req.body;

            if (req.user.userType !== 'lehrbetrieb') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Lehrbetrieb kann Lernende hinzufügen.' });
            }

            const [existingLernender] = await pool.query("SELECT * FROM lernender WHERE benutzername = ?", [benutzername]);
            if (existingLernender.length > 0) {
                return res.status(400).json({ error: "Benutzername bereits vergeben." });
            }

            const hashedPassword = await bcrypt.hash(passwort, 10);
            const sql = `
                INSERT INTO lernender (benutzername, passwort, name, vorname, beruf, berufsschule)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const values = [benutzername, hashedPassword, name, vorname, beruf, berufsschule];
            await pool.query(sql, values);

            res.status(201).json({ message: "Lernender erfolgreich registriert." });
        } catch (error) {
            console.error("Fehler bei der Lernenden-Registrierung:", error);
            res.status(500).json({ error: "Fehler bei der Lernenden-Registrierung." });
        }
    },

    getLehrbetriebe: async (req, res) => {
        try {
            // Überprüfen, ob der authentifizierte Benutzer ein Admin ist
            if (req.user.userType !== 'admin') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Admins können Lehrbetriebe abrufen.' });
            }

            const [lehrbetriebe] = await pool.query("SELECT * FROM lehrbetrieb");
            res.json({ data: lehrbetriebe });
        } catch (error) {
            console.error("Fehler beim Abrufen der Lehrbetriebe:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Lehrbetriebe." });
        }
    },


    // Login für Admin, Berufsbildner, Lernende und Lehrbetrieb
    login: async (req, res) => {
        try {
            const { benutzername, passwort } = req.body;
    
            // Versuche, den Benutzer in allen Tabellen zu finden
            const [admin] = await pool.query("SELECT * FROM admin WHERE benutzername = ?", [benutzername]);
            const [berufsbildner] = await pool.query("SELECT * FROM berufsbildner WHERE benutzername = ?", [benutzername]);
            const [lernender] = await pool.query("SELECT * FROM lernender WHERE benutzername = ?", [benutzername]);
            const [lehrbetrieb] = await pool.query("SELECT * FROM lehrbetrieb WHERE benutzername = ?", [benutzername]);
    
            let user = null;
            let userType = null;
    
            if (admin.length > 0) {
                user = admin[0];
                userType = 'admin';
            } else if (berufsbildner.length > 0) {
                user = berufsbildner[0];
                userType = 'berufsbildner';
            } else if (lernender.length > 0) {
                user = lernender[0];
                userType = 'lernender';
            } else if (lehrbetrieb.length > 0) {
                user = lehrbetrieb[0];
                userType = 'lehrbetrieb';
            } else {
                return res.status(400).json({ error: "Benutzername oder Passwort falsch." });
            }
    
            // Überprüfe das Passwort
            const validPassword = await bcrypt.compare(passwort, user.passwort);
            if (!validPassword) {
                return res.status(400).json({ error: "Benutzername oder Passwort falsch." });
            }
    
            // Erstelle das Token-Payload mit allen relevanten Informationen
            const tokenPayload = {
                id: user.id,
                benutzername: user.benutzername,
                userType,
                ...user // Alle anderen Benutzerinformationen hinzufügen
            };
    
            const token = jwt.sign(tokenPayload, 'secretKey', { expiresIn: '1h' });
            res.json({ token, userType });
        } catch (error) {
            console.error("Fehler beim Login:", error);
            res.status(500).json({ error: "Fehler beim Login." });
        }
    },
    

    getLehrbetriebe: async (req, res) => {
        try {
            const [lehrbetriebe] = await pool.query("SELECT * FROM lehrbetrieb");
            res.json({ data: lehrbetriebe });
        } catch (error) {
            console.error("Fehler beim Abrufen der Lehrbetriebe:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Lehrbetriebe." });
        }
    },

   // Lernende mit ihren Fächern abrufen (Authentifizierung erforderlich)
getLernendeMitFaecher: async (req, res) => {
    try {
        const lernenderId = req.user.id; // Die Lernenden-ID aus dem authentifizierten Token entnehmen (angenommen, es handelt sich um einen Lernenden)

        // Abrufen aller Fächer, die dem Lernenden zugeordnet sind
        const [faecher] = await pool.query("SELECT * FROM fach WHERE lernender_id = ?", [lernenderId]);

        if (faecher.length === 0) {
            return res.status(404).json({ message: "Keine Fächer gefunden." });
        }

        res.status(200).json({ data: faecher });
    } catch (error) {
        console.error("Fehler beim Abrufen der Fächer:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Fächer." });
    }
},

    // Lernende abrufen (mit Authentifizierung)
getLernende: async (req, res) => {
    try {
        const berufsbildnerId = req.user.id; // Authentifizierter Berufsbildner

        // Abrufen aller Lernenden, die dem Berufsbildner zugeordnet sind
        const [lernende] = await pool.query("SELECT * FROM lernender WHERE berufsbildner_id = ?", [berufsbildnerId]);

        if (lernende.length === 0) {
            return res.status(404).json({ message: "Keine Lernenden gefunden." });
        }

        res.status(200).json({ data: lernende });
    } catch (error) {
        console.error("Fehler beim Abrufen der Lernenden:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Lernenden." });
    }
},


    // Lernenden aktualisieren (Edit)
    updateLernender: async (req, res) => {
        try {
            const { lernenderId } = req.params;
            const { benutzername, name, vorname, beruf, berufsschule } = req.body;

            const sql = `
                UPDATE lernender 
                SET benutzername = ?, name = ?, vorname = ?, beruf = ?, berufsschule = ?
                WHERE id = ?
            `;
            const values = [benutzername, name, vorname, beruf, berufsschule, lernenderId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Lernender erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Lernenden:", error);
            res.status(500).json({ error: "Fehler beim Aktualisieren des Lernenden." });
        }
    },

// Lehrbetrieb und Berufsbildner können Fächer hinzufügen
addFach: async (req, res) => {
    try {
        const { lernenderId, fachname } = req.body; // Lernender ID und Fachname aus dem Request-Body

        // Überprüfen, ob der Benutzer ein Lehrbetrieb oder Berufsbildner ist
        if (req.user.userType !== 'lehrbetrieb' && req.user.userType !== 'berufsbildner') {
            return res.status(403).json({ error: 'Zugriff verweigert: Nur Lehrbetrieb oder Berufsbildner können Fächer hinzufügen.' });
        }

        const sql = `
            INSERT INTO fach (lernender_id, fachname)
            VALUES (?, ?)
        `;
        const values = [lernenderId, fachname];
        await pool.query(sql, values);

        res.status(201).json({ message: "Fach erfolgreich hinzugefügt." });
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Fachs:", error);
        res.status(500).json({ error: "Fehler beim Hinzufügen des Fachs." });
    }
},

    // Fächer eines bestimmten Lernenden abrufen (nur Fachnamen, keine Noten)
getFaecherFuerLernender: async (req, res) => {
    try {
        const { lernenderId } = req.params; // Lernender-ID aus URL-Parametern

        // Abrufen der Fächer für den angegebenen Lernenden
        const [faecher] = await pool.query("SELECT id, fachname FROM fach WHERE lernender_id = ?", [lernenderId]);

        // Rückgabe der Fächer
        res.json({ data: faecher });
    } catch (error) {
        console.error("Fehler beim Abrufen der Fächer für den Lernenden:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Fächer für den Lernenden." });
    }
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

// Lernende mit Fächern und Noten abrufen
getLernendeMitFaecherUndNoten: async (req, res) => {
    try {
        const berufsbildnerId = req.user.id; // Authentifizierter Berufsbildner

        // Alle Lernenden, die dem Berufsbildner zugeordnet sind, abrufen
        const [lernende] = await pool.query("SELECT * FROM lernender WHERE berufsbildner_id = ?", [berufsbildnerId]);

        if (lernende.length === 0) {
            return res.status(404).json({ message: "Keine Lernenden gefunden." });
        }

        // Fächer und Noten für jeden Lernenden abrufen
        const lernendeMitFaecherUndNoten = await Promise.all(lernende.map(async (lernender) => {
            // Fächer für jeden Lernenden abrufen
            const [faecher] = await pool.query("SELECT * FROM fach WHERE lernender_id = ?", [lernender.id]);

            // Noten für jedes Fach abrufen
            const faecherMitNoten = await Promise.all(faecher.map(async (fach) => {
                const [noten] = await pool.query("SELECT * FROM note WHERE fach_id = ?", [fach.id]);
                return {
                    ...fach,
                    noten
                };
            }));

            return {
                ...lernender,
                faecher: faecherMitNoten
            };
        }));

        res.json({ data: lernendeMitFaecherUndNoten });
    } catch (error) {
        console.error("Fehler beim Abrufen der Lernenden mit Fächern und Noten:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Lernenden mit Fächern und Noten." });
    }
},
 // Noten für ein Fach abrufen
 getNotenFuerFach: async (req, res) => {
    try {
        const { fachId } = req.params; // Fach-ID aus den URL-Parametern

        // Abrufen aller Noten für das angegebene Fach
        const [noten] = await pool.query("SELECT * FROM note WHERE fach_id = ?", [fachId]);

        if (noten.length === 0) {
            return res.status(404).json({ message: "Keine Noten gefunden." });
        }

        res.status(200).json({ data: noten });
    } catch (error) {
        console.error("Fehler beim Abrufen der Noten:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Noten." });
    }
},



   // Noten hinzufügen
addNote: async (req, res) => {
    try {
        const { titel, note } = req.body; // Titel und Note aus dem Request-Body
        const fachId = req.params.fachId; // Fach-ID aus der URL
        const lernenderId = req.user.id; // Lernenden-ID aus dem Token

        // Überprüfen, ob der Benutzer berechtigt ist, Noten hinzuzufügen
        if (req.user.userType !== 'lehrbetrieb' && req.user.userType !== 'berufsbildner' && req.user.userType !== 'lernender') {
            return res.status(403).json({ error: 'Zugriff verweigert: Nur Lehrbetrieb, Berufsbildner oder Lernender können Noten hinzufügen.' });
        }

        const sql = `
            INSERT INTO note (fach_id, titel, note, lernender_id)
            VALUES (?, ?, ?, ?)
        `;
        const values = [fachId, titel, note, lernenderId];
        await pool.query(sql, values);

        res.status(201).json({ message: "Note erfolgreich hinzugefügt." });
    } catch (error) {
        console.error("Fehler beim Hinzufügen der Note:", error);
        res.status(500).json({ error: "Fehler beim Hinzufügen der Note." });
    }
},


    // Fach aktualisieren
    updateFach: async (req, res) => {
        try {
            const { fachId } = req.params;
            const { fachname } = req.body;

            const sql = `
                UPDATE fach 
                SET fachname = ?
                WHERE id = ?
            `;
            const values = [fachname, fachId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Fach erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Fachs:", error);
            res.status(500).json({ error: "Fehler beim Aktualisieren des Fachs." });
        }
    },

    // Note aktualisieren
    updateNote: async (req, res) => {
        try {
            const { fachId } = req.params;
            const { note } = req.body;

            const sql = `
                UPDATE fach 
                SET note = ?
                WHERE id = ?
            `;
            const values = [note, fachId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Note erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Aktualisieren der Note:", error);
            res.status(500).json({ error: "Fehler beim Aktualisieren der Note." });
        }
    },

    // Note löschen
    deleteNote: async (req, res) => {
        try {
            const { fachId } = req.params;

            const sql = `
                UPDATE fach
                SET note = NULL
                WHERE id = ?
            `;
            const values = [fachId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Note erfolgreich gelöscht." });
        } catch (error) {
            console.error("Fehler beim Löschen der Note:", error);
            res.status(500).json({ error: "Fehler beim Löschen der Note." });
        }
    }
};

module.exports = educationController;
