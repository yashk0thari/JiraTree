// Database Connection: [TODO: Import not working with '.require()']
const dbFunctions = {
    DatabaseConnection: function () {
        const { Client } = require("pg");
        const client = new Client(process.env.DATABASE_URL);
    
        (async () => {
        await client.connect();
        try {
            const results = await client.query("SELECT NOW()");
            console.log(results);
        } catch (err) {
            console.error("error executing query:", err);
        } finally {
            client.end();
        }
        })();
    }
}