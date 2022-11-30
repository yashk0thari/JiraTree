// Import Relavent Libraries + Modules:
const dotenv = require("dotenv");
const date = require('date-and-time');

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
const session = require("express-session");
const { use } = require("passport/lib");

// EJS
const path = require('path')
app.use(express.json())

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

app.use(express.static(__dirname + '/public'));

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
// app.use(function(req,res,next){
//     res.locals.currentUser = req.user;
//     next();
//   })
  
app.listen(process.env.PORT, () => {
    console.log("Running on port: " + process.env.PORT + ".");
});

//send to dashboard
app.get("/", (req, res) => {
    // res.send("Hello, JiraTree :D")

    if (req.isAuthenticated()) {
        return res.redirect('/dashboard')
    }
    else {
        return res.redirect('/login')
    }
})

//USER AUTHENTICATION

//REGISTER USERS

app.get("/register", checkNotAuthenticated, async (req, res) => {
    res.render("register")
})

app.post("/register", async (req, res) => {

    let {name, email, password} = req.body;
    const role = "default";
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
    passport
    // email => users.find(user => user.email === email),
    // id => users.find(user => user.id === id ),
)

app.get('/login', (req, res) => {
    res.render("login")
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
        res.redirect('/dashboard');
    }
    return next()
}

//LOGOUT USER
app.post('/logout', function(req, res, next){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
      });
  });

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

// Search Tasks: {"search_task": "<search_task, ex: 001>"}
app.get("/searchTasks/", async (req, res) => {
    try {
        const search_task = await (req.body).search_task;
        const output = await db.searchTask(search_task);

        console.log(output.rows);
        res.send("SUCCESSFULLY SEARCHED TASKS ACCORDING TO QUERY PARAMETERS");
    } catch (error) {
        res.send("Error with Search-Tasks: " + error);
    }
})

// Create Task (Web Page):
app.get("/createTask/", async (req, res) => {
    try {
        const output = await db.getTasks("in_backlog", "TRUE");
        res.render("addTask", {output: output.rows})
    } catch (error) {
        res.send("Error Loading Add Task Web Page")
    }
})

//Get Task by specific Id
app.get("/task/:task_uid/", async (req, res) => {

    try {
        const output = await db.getTasks("task_uid", req.params.task_uid);
        // console.log(output.rows);
        const update = req.query.update;
        res.render("viewTask", {output: output.rows, update: update})
        // res.send("SUCCESSFULLY GOT ALL ENTRIES FROM DATABASE ACCORDING TO QUERY PARAMETERS");
        // res.send(output.rows)
    } catch (error) {
        res.send("Error with Get-All: " + error);
    }
});

// - POST:
// Add Task: {"task_id": "<task_id>", "description": "<description>"}
app.post("/addTask/", async (req, res) => {
    try {
        const task_name = await (req.body).task_name;
        const description = await (req.body).description;
        await db.insertTask(task_name, description);

        // res.send("SUCCESSFULLY ADDED TASK TO DATABASE!");   
        // const output = await db.getTasks("in_backlog", "TRUE");
        // res.render("addTask", {output: output.rows})
        res.redirect('/createTask/')
    } catch (error) {
        res.send("Error with Add-Task: " + error);
    }
});

// Update Task: 
//Still needs testing
app.post("/updateTask/:task_uid", async (req, res) => {
    try {
        const status = await (req.body).status;
        const description = await (req.body).description;
        const in_backlog = await (req.body).in_backlog;
        const user_uid = await (req.body).user_uid;
        const sprint_uid = await (req.body).sprint_uid;
        const task_name = await (req.body).task_name;
        const datetime = await (req.body).datetime;
        
        await db.updateTask(req.params.task_uid, task_name, status, description, in_backlog, datetime, user_uid, sprint_uid);
        res.redirect(`/task/${req.params.task_uid}?update=False`);
    } catch (error) {
        res.redirect(`/task/${req.params.task_uid}?update=False`);
        // res.send("Error with Update-Task: " + error);
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
        const prev_sprint = (req.body).prev_sprint;
        await db.insertSprint(sprint_id, goal, prev_sprint);

        res.redirect("/createSprint");
    } catch (error) {
        console.log("Error with Add-Sprint: " + error);
    }
});

//Add a Sprint (web page)
app.get("/createSprint/", async (req, res) => {
    try {
        const in_progress = await db.getSprints("status", "IN PROGRESS");
        res.render("addSprint", {in_progress: in_progress.rows})
    } catch (error) {
        res.send("Error Loading Add Task Web Page")
    }
})

//Get Sprint By Id
app.get("/sprint/:sprint_uid/", async (req, res) => {

    try {
        const output = await db.getSprints("sprint_uid", req.params.sprint_uid);
        // console.log(output.rows);
        const update = req.query.update;
        res.render("viewSprint", {output: output.rows, update: update})
        // res.send("SUCCESSFULLY GOT ALL ENTRIES FROM DATABASE ACCORDING TO QUERY PARAMETERS");
        // res.send(output.rows)
    } catch (error) {
        res.send("Error with Get-All: " + error);
    }
});


// - DASHBOARD:

app.get("/dashboard", async (req, res) => {
    const tasks_obj = await db.getTasks("in_backlog", "TRUE")
    const backlogTasks = tasks_obj.rows

    const sprints_obj = await db.getAll("jt_sprint.sprints")
    const allSprints = sprints_obj.rows

    var sprint_tasks = {}

    let name = "Not Logged In"
    if (req.user) {
        name = req.user.rows[0].name;
    }

    for (let sprint of allSprints) {
        tasks = await db.getTasks("sprint_uid", sprint.sprint_uid)
        sprint_tasks[sprint.sprint_uid] = tasks.rows
    }

    res.render("dashboard", {tasks:backlogTasks, date:date, sprints:allSprints, sprint_tasks:sprint_tasks, username: name})
})

app.get("/test", async (req, res) => {
    res.render("test")
})
app.get("/profile", async (req, res) => {
    res.render("profile")
})