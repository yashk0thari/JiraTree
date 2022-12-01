// Database Functions:
class DatabaseFunctions {
    constructor() {
        this.db_init = require("./dbinit");
    }

    async query(sql_block) {
        const { Client } = require("pg");
        const client = new Client(process.env.DATABASE_URL);

            await client.connect();
        try {
            var output = await client.query(sql_block);
            return output;
        } catch (err) {
            console.error("Error with Query!", err);
        } finally {
            client.end();
        }
    }

    async initializeConnection() {
        await this.query(this.db_init.select_now);
    }

    async initializeDatabase() {
        await this.query(this.db_init.init_schemas + "\n" + this.db_init.init_tables);
    }

    async insertBacklog(project_uid) {
        await this.query(`INSERT INTO jt_sprint.sprints (sprint_id, status, goal, prev_sprint, project_uid, is_backlog) VALUES ('0000', 'BACKLOG', 'FINISH PROJECT', NULL, '${project_uid}', 'TRUE');`)
    }

    async insertTask(task_name, description, project_uid) {
        await this.query(`INSERT INTO jt_task.tasks (task_name, status, description, datetime, user_uid, sprint_uid, project_uid) VALUES ('${task_name}', 'NOT STARTED', '${description}', CURRENT_TIMESTAMP, (SELECT user_uid FROM jt_user.users WHERE name = 'UNASSIGNED'), (SELECT sprint_uid FROM jt_sprint.sprints WHERE project_uid = '${project_uid}' AND is_backlog = 'TRUE'), '${project_uid}');`);
    }

    async getBacklog(project_uid) {
       var output =  await this.query(`SELECT * FROM jt_sprint.sprints WHERE project_uid = '${project_uid}' AND is_backlog = 'TRUE';`);
       return output;
    }

    async insertSprint(sprint_id, goal, prev_sprint, project_uid) {
        await this.query(`INSERT INTO jt_sprint.sprints (sprint_id, status, goal, prev_sprint, project_uid) VALUES ('${sprint_id}', 'IN PROGRESS', '${goal}', '${prev_sprint}', '${project_uid}');`);
    }

    async insertProject() {
        const output = await this.query(`INSERT INTO jt_project.projects (project_uid) VALUES (unique_rowid());`)
    }

    async getTasks(meta_field, value) {
        var output = await this.query(`SELECT * FROM jt_task.tasks WHERE ${meta_field} = '${value}';`);
        return output;
    }

    async getSprints(meta_field, value) {
        var output = await this.query(`SELECT * FROM jt_sprint.sprints WHERE ${meta_field} = '${value}';`);
        return output;
    }

    async getSprintsInProgress(project_uid) {
        var output = await this.query(`SELECT * FROM jt_sprint.sprints WHERE project_uid = '${project_uid}' AND status = 'IN PROGRESS';`);
        return output;
    }

    async getSprintsOfProject(project_uid) {
        console.log(`SELECT * FROM jt_sprint.sprints WHERE project_uid = '${project_uid}' AND is_backlog = 'FALSE';`)
        var output = await this.query(`SELECT * FROM jt_sprint.sprints WHERE project_uid = '${project_uid}' AND is_backlog = 'FALSE';`);
        return output;
    }

    async insertUser(name, email, password, role) {
        await this.query(`INSERT INTO jt_user.users (name, email, password, role) VALUES ('${name}', '${email}', '${password}', '${role}');`);
    }

    async getUsers(meta_field, value) {
        var output = await this.query(`SELECT * FROM jt_user.users WHERE ${meta_field} = '${value}'`)
        return output;
    }
    
    async getAll(table_name) {
        var output = await this.query(`SELECT * FROM ${table_name};`);
        return output;
    }

    async getDateNotBacklog() {
        var output = await this.query(`SELECT datetime FROM jt_task.tasks WHERE sprint_uid != 814754907646558210;`);
        return output;
    }

    async deleteTask(task_uid) {
        await this.query(`DELETE FROM jt_task.tasks WHERE task_uid = '${task_uid}'`)
    }

    async deleteSprint(sprint_uid) {
        await this.query(`DELETE FROM jt_sprint.sprints WHERE sprint_uid = '${sprint_uid}'`)
    }

    async updateSprint(sprint_uid, sprint_id, status, goal, prev_sprint) {
        var line = ""
        if (sprint_id != "") {
            line += `sprint_id = '${sprint_id}', `
        }

        if (status != "") {
            line += `status = '${status}', `
        }

        if (goal != "") {
            line += `goal = '${goal}', `
        }

        if (prev_sprint != "") {
            line += `prev_sprint = '${prev_sprint}', `
        }

        if (line.slice(-2)[0] === ",") {
            line = line.substring(0, line.length - 2)
        }
        
        await this.query(`UPDATE jt_sprint.sprints SET ${line} WHERE sprint_uid = '${sprint_uid}';`)
    }

    async updateTask(task_uid, task_name, status, description, deadline, user_uid, sprint_uid) {
        var line = ""
        if (task_name != "") {
            line += `task_name = '${task_name}', `
        }

        if (status != "") {
            line += `status = '${status}', `
        }

        if (description != "") {
            line += `description = '${description}', `
        }

        if (deadline != "") {
            line += `deadline = '${deadline}', `
        }

        if (user_uid != "") {
            line += `user_uid = '${user_uid}', `
        }

        if (sprint_uid != "") {
            line += `sprint_uid = '${sprint_uid}', `
        }

        if (line.slice(-2)[0] === ",") {
            line = line.substring(0, line.length - 2)
        }
        
        await this.query(`UPDATE jt_task.tasks SET ${line} WHERE task_uid = '${task_uid}';`)
    }

    async searchTask(contain_string) {
        var output = await this.query(`SELECT * FROM jt_task.tasks WHERE task_name LIKE '%${contain_string}%';`)
        return output;
    }
}

module.exports = DatabaseFunctions;