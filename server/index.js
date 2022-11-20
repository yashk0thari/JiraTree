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

//User Auth
const bcrypt = require("bcrypt");
const passport = require("passport");
const initializePassport = require('./src/services/passport-config');

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

//USER AUTHENTICATION

//Register Users

app.get("/register", async (req, res) => {
    res.send("Register User!")
})

const users = []
app.post("/register", async (req, res) => {
    
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    try {
        const hashed_password = await bcrypt.hash(password, 10)
        const toPush = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: hashed_password
        }
        users.push(toPush)
        res.send(toPush)

    } catch {
        res.send("Encountered an Error!")
    }
    console.log(users)
});

//Login Users


// TASK:
// ...

// SPRINT:
// ...

// POST REQUESTS:
// USER:
// ...

// TASK:
// Add Task: {"task_id": "<task_id>", "description": "<description>"}
app.post("/addTask/", (req, res) => {
    const task_id = (req.body).task_id;
    const description = (req.body).description;
    
    db.insertTask(task_id, description);
    res.send("SUCCESSFULLY ADDED TASK TO DATABASE!");
});

// SPRINT:
// ...