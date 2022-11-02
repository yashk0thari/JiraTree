// Import Relavent Libraries + Modules:
const dotenv = require("dotenv");

// Configure Enviornment File:
dotenv.config();

// Begin Express Connection:
const express = require("express");
const app = express();

// Database Connection:
function DatabaseConnection () {
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
DatabaseConnection()

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.listen(process.env.PORT, () => {
    console.log("Running on port: " + process.env.PORT + ".");
});