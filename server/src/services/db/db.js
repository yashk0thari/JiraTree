// Database Functions:
class DatabaseFunctions {
    constructor() {
        this.db_init = require("./dbinit");
    }

    query(sql_block) {
        const { Client } = require("pg");
        const client = new Client(process.env.DATABASE_URL);
    
        (async () => {
        await client.connect();
        try {
            const results = await client.query(sql_block);
            console.log(results);
            return results;
        } catch (err) {
            console.error("error executing query:", err);
        } finally {
            client.end();
        }
        })();
    }

    initializeConnection() {
        this.query(this.db_init.select_now);
    }

    initializeDatabase() {
        this.query(this.db_init.init_schemas + "\n" + this.db_init.init_tables);
    }

    insertTask(task_id, description) {
        this.query(`INSERT INTO jt_task.tasks (task_id, status, description, in_backlog, user_uid, sprint_uid) VALUES ('${task_id}', 'NOT STARTED', '${description}', 'TRUE', (SELECT user_uid FROM jt_user.users WHERE name = 'UNASSIGNED'), (SELECT sprint_uid FROM jt_sprint.sprints WHERE sprint_id = '0000'))`);
    }

    getTasks(meta_field, value) {
        const output = this.query(`SELECT * FROM jt_task.tasks WHERE ${meta_field} = '${value}'`);
        return output;
    }
}

module.exports = DatabaseFunctions;