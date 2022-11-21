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
const bcrypt = require("bcrypt")
const passport = require("passport")
const initializePassport = require('./src/services/passport-config')
const session = require("express-session")

// Connect Database:
db.initializeConnection()
db.initializeDatabase()


//use statements
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())

app.listen(process.env.PORT, () => {
    console.log("Running on port: " + process.env.PORT + ".");
});

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

//USER AUTHENTICATION

//REGISTER USERS

app.get("/register", checkNotAuthenticated, async (req, res) => {
    res.send("Register User!")
})

app.post("/register", checkNotAuthenticated, async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.email;
    try {
        const hashed_password = await bcrypt.hash(password, 10)
        db.insertUser(name, email, hashed_password, role)
        res.send('New User Created in Database!')
    } catch {
        res.send("Encountered an Error!")
    }
});

//LOGIN USER 
initializePassport(
    passport,
    db.getUsers,
    db.getUserByEmail,
    db.getUserById
    // email => users.find(user => user.email === email),
    // id => users.find(user => user.id === id ),
)

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.send("Login Page")
})

//passport authentication middleware
app.post('/login', passport.authenticate('local', {
    successRedirect: '/', 
    failureRedirect: '/login', 
    failureMessage: true,
})
)

//checking authenticated users - middleware

//SAMPLE PAGE - only for authenticated users
app.get('/authenticated', checkAuthenticated, (req, res) => {
    res.send("Authenticated!")
})

function checkAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
        //everything works!
        return next()
    }
    else {
        res.redirect('/login')
    }
}

function checkNotAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/authenticated')
    }
    next()
}

//LOGOUT USER
// app.delete('/logout', (req, res) => {
//     req.logOut()
//     res.redirect('/login')
// })

// --- General:
// - GET:
// Get All: {"table_name": "<table_name, ex: jt_user.users>"}
app.get("/getAll/", async (req, res) => {
    try {
        const table_name = await (req.body).table_name;
        const output = await db.getAll(table_name);

        console.log(output.rows);
        res.send("SUCCESSFULLY GOT ALL ENTRIES FROM DATABASE ACCORDING TO QUERY PARAMETERS");
    } catch (error) {
        res.send("Error with Get-All: " + error);
    }
});

// - POST:
// ...

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
        const meta_field = await (req.body).meta_field;
        const value = await (req.body).value;
        const output = await db.getTasks(meta_field, value);

        console.log(output.rows);
        res.send("SUCCESSFULLY GOT TASKS ACCORDING TO QUERY PARAMETERS");
    } catch (error) {
        res.send("Error with Get-Tasks: " + error);
    }
})

// - POST:
// Add Task: {"task_id": "<task_id>", "description": "<description>"}
app.post("/addTask/", async (req, res) => {
    try {
        const task_id = await (req.body).task_id;
        const description = await (req.body).description;
        const output = await db.insertTask(task_id, description);

        console.log(output.rows);
        res.send("SUCCESSFULLY ADDED TASK TO DATABASE!");   
    } catch (error) {
        res.send("Error with Add-Task: " + error);
    }
});

// --- SPRINT:
// - GET:
// Get Sprints: {"meta_field": "<meta_field, ex: sprint_id>", "value": "<value, ex: 0000>"}
app.get("/getSprints/", async (req, res) => {
    try {
        const meta_field = (req.body).meta_field;
        const value = (req.body).value;
        const output = await db.getSprints(meta_field, value);

        console.log(output.rows);
        res.send("SUCCESSFULLY GOT SPRINTS ACCORDING TO QUERY PARAMETERS");
    } catch (error) {
        console.log("Error with Get-Sprints: " + error);
    }
});

// - POST:
app.post("/addSprint/", async (req, res) => {
    try {
        const sprint_id = (req.body).sprint_id;
        const goal = (req.body).goal;
        const output = await db.insertSprint(sprint_id, goal);

        console.log(output.rows);
        res.send("SUCCESSFULLY ADDED SPRINT TO DATABASE");
    } catch (error) {
        console.log("Error with Add-Sprint: " + error);
    }
});