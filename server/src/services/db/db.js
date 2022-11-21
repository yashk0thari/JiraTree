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


    insertUser(name, email, password, role) {
        const { Client } = require("pg");
        const client = new Client(process.env.DATABASE_URL);
        (async () => {
            await client.connect();
            try {
                const insert_user = await client.query(`INSERT INTO jt_user.users (name, email, password, role) VALUES ('${name}', '${email}', '${password}', '${role}');`);
                console.log(insert_user);
            } catch (err) {
                console.error("Error Executing Query, Insert User:", err);
            } finally {
                client.end();
            }
            })(); 
    }

    async getUserByEmail(email) {
        const { Client } = require("pg");
        const client = new Client(process.env.DATABASE_URL);
            await client.connect();
        try {
            var output = await client.query(`SELECT * FROM jt_user.users WHERE email = '${email}'`)
            return output.rows[0]
        } catch (err) {
            console.error("Error getting User by email!", err);
        } finally {
            client.end();
        }

    }

    async getUserById(user_uid) {
        const { Client } = require("pg");
        const client = new Client(process.env.DATABASE_URL);

            await client.connect();
            try {
                const output = await client.query(`SELECT * FROM jt_user.users WHERE user_uid = '${user_uid}'`)
                return output
            } catch (err) {
                console.error("Error getting User by email!", err);
            } finally {
                client.end();
            }
    }
    getTasks(meta_field, value) {
        const output = this.query(`SELECT * FROM jt_task.tasks WHERE ${meta_field} = '${value}'`);
        return output;
    }
}

module.exports = DatabaseFunctions;