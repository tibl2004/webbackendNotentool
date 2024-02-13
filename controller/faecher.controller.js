const pool = require("../database/index");

const faecherController = {
    getAll: async (req, res) => {
        try {
            const [rows, fields] = await pool.query("SELECT * FROM faecher");
            res.json({ data: rows });
        } catch (error) {
            console.error(error);
            res.json({ status: "error" });
        }
    },
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows, fields] = await pool.query("SELECT * FROM faecher WHERE id = ?", [id]);
            res.json({ data: rows });
        } catch (error) {
            console.error(error);
            res.json({ status: "error" });
        }
    },
    getPruefungenForFach: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows, fields] = await pool.query("SELECT * FROM pruefungen WHERE fach_id = ?", [id]);
            res.json({ data: rows });
        } catch (error) {
            console.error(error);
            res.json({ status: "error" });
        }
    },
    create: async (req, res) => {
        try {
            const { name } = req.body;
            const sql = "INSERT INTO faecher (name) VALUES (?)";
            const [rows, fields] = await pool.query(sql, [name]);
            res.json({ data: rows });
        } catch (error) {
            console.error(error);
            res.json({ status: "error" });
        }
    },
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const sql = "UPDATE faecher SET name = ? WHERE id = ?";
            const [rows, fields] = await pool.query(sql, [name, id]);
            res.json({ data: rows });
        } catch (error) {
            console.error(error);
            res.json({ status: "error" });
        }
    },
    remove: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows, fields] = await pool.query("DELETE FROM faecher WHERE id = ?", [id]);
            res.json({ data: rows });
        } catch (error) {
            console.error(error);
            res.json({ status: "error" });
        }
    }
};

module.exports = faecherController;
