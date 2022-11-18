// Import SQL files:

// async function jt_retry(n, max, client, operation, callback) {
//     const backoffInterval = 100; // milliseconds
//     const maxTries = 5;
//     let tries = 0;
  
//     while (true) {
//       await client.query('BEGIN;');
  
//       tries++;
  
//       try {
//         const result = await operation(client, callback);
//         await client.query('COMMIT;');
//         return result;
//       } catch (err) {
//         await client.query('ROLLBACK;');
  
//         if (err.code !== '40001' || tries == maxTries) {
//           throw err;
//         } else {
//           console.log('Transaction failed. Retrying.');
//           console.log(err.message);
//           await new Promise(r => setTimeout(r, tries * backoffInterval));
//         }
//       }
//     }
// }

// Database Connection:
class DatabaseFunctions {
    constructor() {
        this.db_init = require("./dbinit");
    }

    initializeConnection() {
        const { Client } = require("pg");
        const client = new Client(process.env.DATABASE_URL);
    
        (async () => {
        await client.connect();
        try {
            const results = await client.query(this.db_init.select_now);
            console.log(results);
        } catch (err) {
            console.error("error executing query:", err);
        } finally {
            client.end();
        }
        })();
    }

    initializeDatabase() {
        const { Client } = require("pg");
        const client = new Client(process.env.DATABASE_URL);

        (async () => {
        await client.connect();
        try {
            const schema_results = await client.query(this.db_init.init_schemas);
            const table_results = await client.query(this.db_init.init_tables);
            console.log(schema_results);
            console.log(table_results);
        } catch (err) {
            console.error("error executing query:", err);
        } finally {
            client.end();
        }
        })();
    }

    insertTask(task_id, description) {
        const { Client } = require("pg");
        const client = new Client(process.env.DATABASE_URL);

        (async () => {
        await client.connect();
        try {
            const insert_task = await client.query(`INSERT INTO jt_task.tasks (task_id, status, description, in_backlog, user_uid, sprint_uid) VALUES ('${task_id}', 'NOT STARTED', '${description}', 'TRUE', (SELECT user_uid FROM jt_user.users WHERE name = 'UNASSIGNED'), (SELECT sprint_uid FROM jt_sprint.sprints WHERE sprint_id = '0000'))`);
            console.log(insert_task);
        } catch (err) {
            console.error("Error Executing Query, Insert Task:", err);
        } finally {
            client.end();
        }
        })();
    }
}

module.exports = DatabaseFunctions;