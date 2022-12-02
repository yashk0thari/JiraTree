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
const emailCheck = require("email-check");

//SMTP server
const nodemailer = require("nodemailer");

// EJS
const path = require('path');
const { stat } = require("fs");
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

//SMTP-EMAIL-SERVER
const smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    pool: true,
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use TLS
    auth: {
      user: "jira.tree1@gmail.com",
      pass: "oluvdapolzctcgyc",
    },
  });

async function sendMail(name, email, project_uid) {
    await smtpTransport.sendMail({
        from: "jira.tree1@gmail.com",
        to: email.toString(),
        subject: "Hello " + name.toUpperCase() + " here's your Project Id for JiraTree",
        text: "You just created a new project with Project Id: " + project_uid + ". Happy Organizing!",
    })
}

//send to dashboard
app.get("/", (req, res) => {
    // res.send("Hello, JiraTree :D")

    if (req.isAuthenticated()) {
        return res.redirect('/project')
    }
    else {
        return res.redirect('/login')
    }
})

//USER AUTHENTICATION

//REGISTER USERS

app.get("/register", checkNotAuthenticated, async (req, res) => {
    const error = req.query.error;
    res.render("register", {error: error})
})

app.post("/register", async (req, res) => {

    let {name, email, password} = req.body;
    const role = "default";

    try {
        const users = await db.getUsers("email", email);
        if (users.rows.length > 0){
            return res.redirect("/register?error=True")
        }
        const hashed_password = await bcrypt.hash(password, 10)
        db.insertUser(name, email, hashed_password, role)
        res.redirect('/login')
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

// --- PROJECT:
// - GET:
// Create Project (Web Page):
app.get("/project/", async (req, res) => {
    var error = "";
    if (req.query.error == "invalidProjectKey") {
        error = "Invalid Project Key Entered, Try Again!"
    }
    try {
        res.render("project", {error: error})
    } catch (error) {
        res.send("Error with loading Project Page: " + error);
    }
})

// - POST:
// Create Project: 
app.post("/addProject/", async (req, res) => {
    try {
        await db.insertProject()
        const output = await db.getAll("jt_project.projects")
        const num_projects = (output.rows).length
        const current = output.rows[num_projects - 1]
        await db.insertBacklog(current.project_uid)

        if (req.user) {
            const name = req.user.rows[0].name;
            const email = req.user.rows[0].email;
            sendMail(name, email, current.project_uid).catch((e) => {
                console.log(e);
            })
        }

        res.redirect(`/dashboard/${current.project_uid}`)
    } catch (error) {
        res.send("Error with Create-Project: " + error);
    }
})

app.post("/getProject", async (req, res) => {
    try {
        const project_uid = await req.body.project_uid
        const output = await db.getAll("jt_project.projects")

        for (let project of output.rows) {
            if (project.project_uid == project_uid) {
                return res.redirect(`/dashboard/${project_uid}`)
            }
        }

        return res.redirect("/project?error=invalidProjectKey")
    } catch (error) {
        res.send("Error with getting project_uid: " + error)
    }
})


// --- TASK:
// - GET:
// Get Tasks: {"meta_field": "<meta_field, ex: in_backlog>", "value": "<value, ex: TRUE>"}
app.get("/getTasks/", async (req, res) => {
    try {
        const meta_field = await (req.body).meta_field;
        const value = await (req.body).value;
        const output = await db.getTasks(meta_field, value);

        res.send("SUCCESSFULLY GOT TASKS ACCORDING TO QUERY PARAMETERS");
    } catch (error) {
        res.send("Error with Get-Tasks: " + error);
    }
})


// Create Task (Web Page):
app.get("/createTask/:project_uid", async (req, res) => {
    try {
        const backlogSprintObj = await db.getBacklog(req.params.project_uid);
        const backlogSprint = backlogSprintObj.rows[0];
        const backlogSprintId = backlogSprint.sprint_uid;

        const output = await db.getTasks("sprint_uid", backlogSprintId);
        res.render("addTask", {output: output.rows, project_uid:req.params.project_uid})
    } catch (error) {
        res.send("Error Loading Add Task Web Page")
    }
})

//Get Task by specific Id
app.get("/task/:task_uid", async (req, res) => {
    
        const status = ["NOT STARTED", "IN PROGRESS", "COMPLETED"]
        const project_uid = req.query.project_uid;
        const output = await db.getTasks("task_uid", req.params.task_uid);
        const update = req.query.update;

        //Get Sprint Object with Foreign Key
        const sprint_uid = output.rows[0].sprint_uid;
        const sprint = await db.getSprints("sprint_uid", sprint_uid);
        const goal = sprint.rows[0].goal;
        const sprint_id = sprint.rows[0].sprint_id;
        
        //Get all sprints of that Project
        const sprint_objs = await db.getSprintsOfProject(project_uid);
        const sprints = sprint_objs.rows;

        //Get all Users
        const user_objs = await db.getAll("jt_user.users");
        const users = user_objs.rows;

        //Get User Object with Foreign Key
        const user_uid = output.rows[0].user_uid;
        const user = await db.getUsers("user_uid", user_uid);
        const username = user.rows[0].name;        

        res.render("viewTask", {output: output.rows, update: update, goal: goal, sprint_id: sprint_id, username: username, sprints: sprints, users: users, date: date, project_uid: project_uid, status: status});
});

// - POST:
// Add Task: {"task_id": "<task_id>", "description": "<description>"}
app.post("/addTask/:project_uid", async (req, res) => {
    try {
        const task_name = await (req.body).task_name;
        const description = await (req.body).description;
        await db.insertTask(task_name, description, req.params.project_uid);

        // res.send("SUCCESSFULLY ADDED TASK TO DATABASE!");   
        // const output = await db.getTasks("in_backlog", "TRUE");
        // res.render("addTask", {output: output.rows})
        res.redirect(`/createTask/${req.params.project_uid}`)
    } catch (error) {
        res.send("Error with Add-Task: " + error);
    }
});

// Update Task: 
app.post("/updateTask/:task_uid", async (req, res) => {
    try {
        let {status, description, user_uid, sprint_uid, task_name, deadline} = req.body;

        
        await db.updateTask(req.params.task_uid, task_name, status, description, deadline, user_uid, sprint_uid);
        res.redirect(`/task/${req.params.task_uid}?project_uid=${req.query.project_uid}&update=False`);
    } catch (error) {
        res.redirect(`/task/${req.params.task_uid}?project_uid=${req.query.project_uid}&update=False`);
        // res.send("Error with Update-Task: " + error);
    }
});

// Delete Task:
app.post("/deleteTask/:task_uid", async (req, res) => {
    try {
        await db.deleteTask(req.params.task_uid);
        res.redirect(`/dashboard/${req.query.project_uid}`);
    } catch (error) {
        res.send("Error with Delete-Task: " + error);
    }
})

// --- SPRINT:
// - GET:
// Get Sprints: {"meta_field": "<meta_field, ex: sprint_id>", "value": "<value, ex: 0000>"}
app.get("/getSprints/", async (req, res) => {
    try {
        const meta_field = (req.body).meta_field;
        const value = (req.body).value;
        const output = await db.getSprints(meta_field, value);

        res.send("SUCCESSFULLY GOT SPRINTS ACCORDING TO QUERY PARAMETERS");
    } catch (error) {
        console.log("Error with Get-Sprints: " + error);
    }
});

// - POST:
app.post("/addSprint/:project_uid", async (req, res) => {
    try {
        const sprint_id = (req.body).sprint_id;
        const goal = (req.body).goal;
        const prev_sprint = (req.body).prev_sprint;
        await db.insertSprint(sprint_id, goal, prev_sprint, req.params.project_uid);

        res.redirect(`/createSprint/${req.params.project_uid}`);
    } catch (error) {
        console.log("Error with Add-Sprint: " + error);
    }
});

// Update Sprint:
app.post("/updateSprint/:sprint_uid", async (req, res) => {
    try {

        let {sprint_id, status, goal, prev_sprint} = req.body;

        await db.updateSprint(req.params.sprint_uid, sprint_id, status, goal, prev_sprint);
        res.redirect(`/sprint/${req.params.sprint_uid}?project_uid=${req.query.project_uid}&update=False`);
    } catch (error) {
        res.redirect(`/sprint/${req.params.sprint_uid}?project_uid=${req.query.project_uid}&update=False`);
        // res.send("Error with Update-Sprint: " + error);
    }
})

// Delete Sprint:
app.post("/deleteSprint/:sprint_uid", async (req, res) => {
    try {
        console.log("Project UID: >> " + req.query.project_uid)
        console.log("Sprint UID: >> " + req.params.sprint_uid)
        await db.deleteSprint(req.params.sprint_uid, req.query.project_uid);
        res.redirect(`/project`);
    } catch (error) {
        res.send("Error with Delete-Sprint: " + error);
    }
})

//Add a Sprint (web page)
app.get("/createSprint/:project_uid", async (req, res) => {
    try {
        const backlogSprintObj = await db.getBacklog(req.params.project_uid);
        const backlogSprint = backlogSprintObj.rows[0];
        const backlogSprintId = backlogSprint.sprint_uid;

        //Get Sprints of that particular Project for assigning the previous sprint
        const sprint_objs = await db.getSprintsOfProjectIncludingBacklog(req.params.project_uid);
        const sprints = sprint_objs.rows;

        const in_progress = await db.getSprintsInProgress(req.params.project_uid);
        res.render("addSprint", {sprints: sprints, in_progress: in_progress.rows, project_uid: req.params.project_uid})
    } catch (error) {
        res.send("Error Loading Add Task Web Page")
    }
})

//Get Sprint By Id
app.get("/sprint/:sprint_uid/", async (req, res) => {

    try {
        const output = await db.getSprints("sprint_uid", req.params.sprint_uid);
        // console.log(output.rows);

        //Get all sprints
        const sprint_objs = await db.getSprintsOfProjectIncludingBacklog(req.query.project_uid);
        const sprints = sprint_objs.rows;

        //Get Previous Sprint
        let prev_sprint = null;
        try {
            const prev_sprint_obj = await db.getSprints("sprint_uid", output.rows[0].prev_sprint);
            prev_sprint = prev_sprint_obj.rows[0].sprint_id;
        } catch {
            prev_sprint = null;
        }
        
        
        const update = req.query.update;
        res.render("viewSprint", {output: output.rows, update: update, sprints: sprints, prev_sprint: prev_sprint, project_uid:req.query.project_uid})
        // res.send("SUCCESSFULLY GOT ALL ENTRIES FROM DATABASE ACCORDING TO QUERY PARAMETERS");
        // res.send(output.rows)
    } catch (error) {
        res.send("Error with Get-All: " + error);
    }
});


// - DASHBOARD and FILTERS:


// app.post("/filterStatus/:project_uid", async (req, res) => {
//     try {
//         const project_uid = req.params.project_uid;
//         return res.redirect(`/dashboard/${project_uid}?filterStatus=${req.body.statusFilter}`)
//     } catch {
//         res.redirect('/test');
//     }
// })

// Search Tasks: {"search_task": "<search_task, ex: 001>"}
app.post("/searchTasks/:project_uid", async (req, res) => {
    try {
        // logic - get sprint that's the backlog sprint, only those ones are to be filtered and displayed really
        const project_uid = req.params.project_uid;
        const route_string = `/dashboard/${project_uid}?`;
        var filter_string = ``;

        console.log(req.body)
        if (req.body.search){
            filter_string += `&filter=${req.body.search}`
        }

        if (req.body.statusFilter){
            filter_string += `&statusFilter=${req.body.statusFilter}`
        }

        if (req.body.userFilter){
            console.log(req.body.userFilter);
            filter_string += `&userFilter=${req.body.userFilter}`
        }

        return res.redirect(route_string + filter_string)
    } catch (error) {
        res.send("Error with Search-Tasks: " + error);
    }
})

app.get("/dashboard/:project_uid", async (req, res) => {
    var userTasks = []
    if (req.user) {
        const user_uid = req.user.rows[0].user_uid;
        const output = await db.getUserTasks(user_uid, req.params.project_uid)
        userTasks = output.rows
    }

    // Get all Tasks in Project:
    const all_project_tasks_output = await db.getTasksByProject(req.params.project_uid)
    const all_project_tasks = all_project_tasks_output.rows

    // Get all Users in Project:
    var user_uids = []
    var user_names = []
    for (let project_task of all_project_tasks) {
        
        if (project_task.user_uid != 0) {
            if (!user_uids.includes(project_task.user_uid)) {
                const project_user_output = await db.getUsers("user_uid", project_task.user_uid)
                const project_user = project_user_output.rows[0]
                
                user_uids.push(project_task.user_uid)
                user_names.push(project_user.name)
            }
        }
    }
    

    //Get the Backlog Sprint:
    const backlogSprintObj = await db.getBacklog(req.params.project_uid);
    const backlogSprint = backlogSprintObj.rows[0];
    const backlogSprintId = backlogSprint.sprint_uid;

    //Get all the Tasks in that Backlog Sprint
    const tasksObj = await db.getTasks("sprint_uid", backlogSprintId);
    var backlogTasks = tasksObj.rows;

    //Search Feature Query
    var filterVal = "";
    try {
        if (req.query.filter) {
            const search_task = req.query.filter;
            filterVal = req.query.filter;
            const output = await db.searchTask(search_task, req.params.project_uid, backlogSprintId);
            backlogTasks = output.rows;
        }
    } catch (error) {
        console.log(error)
    }

    const status = ["NOT STARTED", "IN PROGRESS", "COMPLETED"]

    //filter By Category
    var statusFilter = "status";
    try {
        if (req.query.statusFilter) {
            statusFilter = req.query.statusFilter.toString();
            const statusOutput = await db.statusFilter(statusFilter, req.params.project_uid, backlogSprintId);
            backlogTasks = statusOutput.rows;

        }
    } catch (error) {
        console.log(error)
    }

    //filter by UserAssigned
    var userFilter = "user";
    var userFilterUser = "";
    try {

        if (req.query.userFilter) {
            userFilter = req.query.userFilter.toString();
            const userFilterOutput = await db.userFilter(userFilter, req.params.project_uid, backlogSprintId);
            backlogTasks = userFilterOutput.rows;

            const getUser = await db.getUsers("user_uid", userFilter)
            userFilterUser = getUser.rows[0].user_uid;
            userFilter = getUser.rows[0].name;
        }

    } catch (error) {
        console.log(error)
    }

    //Get all Sprints of the current object
    const sprints_obj = await db.getSprintsOfProject(req.params.project_uid)
    const allSprints = sprints_obj.rows

    var sprint_tasks = {}

    let name = "Not Logged In"
    if (req.user) {
        name = req.user.rows[0].name;
    }

    //Get all Tasks associated with the Sprint
    for (let sprint of allSprints) {
        tasks = await db.getTasks("sprint_uid", sprint.sprint_uid)
        sprint_tasks[sprint.sprint_uid] = tasks.rows
    }


    //All Users
    const getUsers = await db.getAll("jt_user.users");
    const allUsers = getUsers.rows;

        //Get Usernames by task
        usernames_by_task = []
        for (let task of backlogTasks) {
            try {
                user = await db.getUsers("user_uid", task.user_uid)
                usernames_by_task.push(user.rows[0].name)
            } catch {
                usernames_by_task.push("UNASSIGNED");
            }
        }
    

    res.render("dashboard", {tasks:backlogTasks, users: usernames_by_task, status: status, allUsers: allUsers, date:date, sprints:allSprints, sprint_tasks:sprint_tasks, username: name, project_uid: req.params.project_uid, userTasks: userTasks, filterVal: filterVal, statusFilter: statusFilter, userFilter: userFilter, userFilterUser:userFilterUser, project_users: user_names})
})

app.get("/calendar", async (req, res) => {
    
})

app.get("/test", async (req, res) => {
    res.render("test")
})
app.get("/profile", async (req, res) => {
    res.render("profile")
})

app.get("/dashboard", async (req, res) => {
    res.render("dashboard")
})