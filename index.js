const express = require("express");
const cors = require("cors");
const app = express();

require('dotenv').config();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const educationRouter = require('./routes/education.router');

app.use("/api/education", educationRouter);



const PORT = process.env.PORT || 3000; // Port 3000 wird verwendet, falls kein anderer Port angegeben ist
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
