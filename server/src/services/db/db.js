// Import SQL files:


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
}

module.exports = DatabaseFunctions;