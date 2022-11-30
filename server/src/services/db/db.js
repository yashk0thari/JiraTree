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

    async insertTask(task_name, description) {
        await this.query(`INSERT INTO jt_task.tasks (task_name, status, description, datetime, user_uid, sprint_uid) VALUES ('${task_name}', 'NOT STARTED', '${description}', 'TRUE', CURRENT_TIMESTAMP, (SELECT user_uid FROM jt_user.users WHERE name = 'UNASSIGNED'), (SELECT sprint_uid FROM jt_sprint.sprints WHERE sprint_id = '0000'));`);
    }

    async insertSprint(sprint_id, goal, prev_sprint) {
        await this.query(`INSERT INTO jt_sprint.sprints (sprint_id, status, goal, prev_sprint) VALUES ('${sprint_id}', 'IN PROGRESS', '${goal}', '${prev_sprint}');`);
    }

    async getTasks(meta_field, value) {
        var output = await this.query(`SELECT * FROM jt_task.tasks WHERE ${meta_field} = '${value}';`);
        return output;
    }

    async getSprints(meta_field, value) {
        var output = await this.query(`SELECT * FROM jt_sprint.sprints WHERE ${meta_field} = '${value}';`);
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