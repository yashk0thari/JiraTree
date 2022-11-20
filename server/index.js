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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(process.env.PORT, () => {
    console.log("Running on port: " + process.env.PORT + ".");
});

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

// --- USER:
// - GET:
// ...

// - POST:
// ...

// --- TASK:
// - GET:
// Get Tasks: {"meta_field": "<meta_field, ex: in_backlog>", "value": "<value, ex: TRUE>"}
app.get("/getTasks/", async (req, res) => {
    try {
        const meta_field = (req.body).meta_field;
        const value = (req.body).value;

        db.getTasks(meta_field, value);
        res.send("SUCCESSFULLY GOT TASKS ACCORDING TO QUERY PARAMETERS");
    } catch (error) {
        console.log("Error with Get-Tasks: " + error);
    }
})

// - POST:
// Add Task: {"task_id": "<task_id>", "description": "<description>"}
app.post("/addTask/", async (req, res) => {
    try {
        const task_id = (req.body).task_id;
        const description = (req.body).description;
        
        db.insertTask(task_id, description);
        res.send("SUCCESSFULLY ADDED TASK TO DATABASE!");   
    } catch (error) {
        console.log("Error with Add-Task: " + error);
    }
});

// --- SPRINT:
// - GET:
// ...

// - POST:
// ...