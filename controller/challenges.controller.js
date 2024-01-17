const pool = require("../database/index");
const challengesController = {
    getAll: async (req, res) => {
        try {
            const [rows, fields] = await pool.query("select * from challenges");
            res.json({
                data: rows
            });
        } catch (error) {
            console.log(error);
            res.json({
                status: "error"
            });
        }
    },
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows, fields] = await pool.query("select * from challenges where id = ?", [id]);
            res.json({
                data: rows
            });
        } catch (error) {
            console.log(error);
            res.json({
                status: "error"
            });
        }
    },
    create: async (req, res) => {
        try {
            const { task } = req.body;
            const sql = "insert into challenges (task) values (?)";
            const [rows, fields] = await pool.query(sql, [task]);
            res.json({
                data: rows
            });
        } catch (error) {
            console.log(error);
            res.json({
                status: "error"
            });
        }
    },
    update: async (req, res) => {
        try {
            const { task } = req.body;
            const { id } = req.params;
            const sql = "update challenges set task = ? where id = ?";
            const [rows, fields] = await pool.query(sql, [task, id]);
            res.json({
                data: rows
            });
        } catch (error) {
            console.log(error);
            res.json({
                status: "error"
            });
        }
    },
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows, fields] = await pool.query("delete from challenges where id = ?", [id]);
            res.json({
                data: rows
            });
        } catch (error) {
            console.log(error);
            res.json({
                status: "error"
            });
        }
    }
};

module.exports = challengesController;
