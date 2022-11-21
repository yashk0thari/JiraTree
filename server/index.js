// Import Relavent Libraries + Modules:
const dotenv = require("dotenv");

// Database:
const DB = require("./src/services/db/db")
const db = new DB()

// Configure Enviornment File:
dotenv.config();

// Begin Express Connection:
const express = require("express");
const app = express();

// Connect Database:
db.initializeConnection()
db.initializeDatabase()

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.listen(process.env.PORT, () => {
    console.log("Running on port: " + process.env.PORT + ".");
});